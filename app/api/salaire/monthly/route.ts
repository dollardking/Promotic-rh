// app/api/salaire/monthly/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';

const prisma = new PrismaClient();

interface DecodedToken {
  id: number;
  role: 'rh' | 'employe' | 'admin';
  exp: number;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let decoded: DecodedToken;

  try {
    decoded = jwtDecode(token);
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  if (decoded.exp * 1000 < Date.now()) {
    return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
  }

  if (decoded.role !== 'rh') {
    return NextResponse.json({ error: 'Accès refusé : rh requis' }, { status: 403 });
  }

  const { mois } = await req.json();
  if (!mois) {
    return NextResponse.json({ error: 'mois requis' }, { status: 400 });
  }

  try {
    const employes = await prisma.employe.findMany();

    const createdSalaires = [];

    for (const employe of employes) {
      // On suppose un salaire de base fixe ou on le récupère ailleurs
      const salaireBase = 300000; // À adapter (ou ajouter un champ salaireBase dans Employe)

      const existing = await prisma.salaire.findFirst({
        where: {
          employeId: employe.id,
          mois: new Date(mois + '-01'),
        },
      });

      if (existing) continue;

      const salaire = await prisma.salaire.create({
        data: {
          employeId: employe.id,
          salaireBase,
          primes: 150,
          deductions: 0,
          mois: new Date(mois + '-01'),
          statut: 'En attente de validation',
        },
      });

      createdSalaires.push(salaire);
    }

    return NextResponse.json({
      message: 'Salaires générés',
      count: createdSalaires.length,
    });
  } catch (error: any) {
    console.error('Erreur génération mensuelle:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}