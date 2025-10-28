import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans GET:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom: string;
    };

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur?.employe?.id) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const salaires = await prisma.salaire.findMany({
      where: { employeId: utilisateur.employe.id },
      orderBy: { mois: 'desc' },
    });

    return NextResponse.json({ salaires }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des salaires:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des salaires' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans POST:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom: string;
    };

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur?.employe?.id) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const { mois, salaireBase, deductions } = await req.json();
    if (!mois || !salaireBase) {
      return NextResponse.json({ error: 'Mois et salaire de base sont requis' }, { status: 400 });
    }

    // Récupérer les présences du mois pour calculer les primes
    const startOfMonth = new Date(mois);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const presences = await prisma.presence.findMany({
      where: {
        employeId: utilisateur.employe.id,
        dateCreation: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    // Calcul des primes basé sur les présences
    let primes = 0;
    const totalDays = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate();
    const presentDays = presences.filter((p) => p.statut === 'Present').length;
    const absenceDays = presences.filter((p) => p.statut === 'Absent' || p.statut === 'AbsentSansJustification').length;

    // Prime : 5% du salaire de base par jour présent (max 50% pour un mois complet)
    primes = (salaireBase * 0.05 * presentDays) / totalDays * 30; // Ajustement pour un mois standard de 30 jours
    // Déduction : 2% par jour d'absence (max 20%)
    const deductionForAbsence = (salaireBase * 0.02 * absenceDays) / totalDays * 30;
    primes = Math.max(0, primes - deductionForAbsence); // Pas de primes négatives

    const salaire = await prisma.salaire.create({
      data: {
        employeId: utilisateur.employe.id,
        mois: new Date(mois),
        salaireBase,
        primes,
        deductions: deductions || 0,
        statut: 'En attente',
      },
    });

    return NextResponse.json({ message: 'Salaire calculé et enregistré avec succès', salaire }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du salaire:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du salaire' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}