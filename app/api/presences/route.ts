import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans POST:', token); // Log pour débogage

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom: string;
    };

    const { date, statut, heureArrivee, heureDepart, trajet } = await req.json();

    if (!date || !statut) {
      return NextResponse.json({ error: 'Date et statut sont requis' }, { status: 400 });
    }

    // Récupérer l'employeId via l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur?.employe?.id) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const presence = await prisma.presence.create({
      data: {
        employeId: utilisateur.employe.id,
        heureArrivee: heureArrivee ? new Date(heureArrivee) : null,
        heureDepart: heureDepart ? new Date(heureDepart) : null,
        trajet: trajet ? new Date(trajet) : null,
        statut,
        dateCreation: new Date(date),
      },
    });

    return NextResponse.json({ message: 'Présence/Absence enregistrée avec succès', presence }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la présence:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement de la présence' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log('Auth header dans GET:', authHeader); // Log pour débogage
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans GET:', token); // Log pour débogage

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

    const presences = await prisma.presence.findMany({
      where: { employeId: utilisateur.employe.id },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json({ presences }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des présences:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des présences' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}