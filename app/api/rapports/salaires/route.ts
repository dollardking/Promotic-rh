// app/api/rapports/salaires/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { mois } = await req.json();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };
    if (decoded.role !== 'rh' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const startOfMonth = new Date(mois);
    startOfMonth.setDate(1);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const employes = await prisma.employe.findMany();

    for (const employe of employes) {
      const presences = await prisma.presence.findMany({
        where: {
          employeId: employe.id,
          dateCreation: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const presentDays = presences.filter(p => p.statut === 'Present').length;
      const absenceDays = presences.filter(p => p.statut === 'Absent' || p.statut === 'AbsentSansJustification').length;

      const totalDays = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate();

      const primes = (employe.salaireBase * 0.05 * presentDays) / totalDays * 30;
      const deductions = (employe.salaireBase * 0.02 * absenceDays) / totalDays * 30;

      await prisma.salaire.create({
        data: {
          employeId: employe.id,
          salaireBase: employe.salaireBase,
          primes,
          deductions,
          mois: startOfMonth,
          statut: 'En attente de validation',
        },
      });
    }

    return NextResponse.json({ message: 'Rapport de paie généré pour le mois' }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport de paie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}