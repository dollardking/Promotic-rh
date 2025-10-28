import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };
    if (decoded.role !== 'rh' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const presences = await prisma.presence.findMany({
      include: { employe: true }, // Inclure les données de l'employé
    });
    return NextResponse.json({ presences }, { status: 200 });
  } catch (error) {
    console.error('Erreur JWT:', error);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };
    if (decoded.role !== 'rh' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { employeId, heureArrivee, heureDepart, trajet, statut } = await req.json();
    const presence = await prisma.presence.create({
      data: {
        employeId,
        heureArrivee: new Date(heureArrivee),
        heureDepart: heureDepart ? new Date(heureDepart) : null,
        trajet: trajet ? new Date(trajet) : null,
        statut,
      },
    });
    return NextResponse.json({ presence }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}