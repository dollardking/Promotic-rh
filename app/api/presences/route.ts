// app/api/presences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// ==================== GET ====================
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

    const whereClause = decoded.role === 'rh' || decoded.role === 'admin'
      ? {}
      : { employe: { utilisateurId: decoded.id } };

    const presences = await prisma.presence.findMany({
      where: whereClause,
      include: {
        employe: { select: { id: true, prenom: true, nom: true, email: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json({ presences }, { status: 200 });
  } catch (err) {
    console.error('Erreur GET presences:', err);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}

// ==================== POST ====================
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur?.employe) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const body = await req.json();
    const { date, statut, heureArrivee, heureDepart } = body;

    if (!date || !statut) {
      return NextResponse.json({ error: 'Date et statut requis' }, { status: 400 });
    }

    // Anti double pointage
    const existing = await prisma.presence.findFirst({
      where: {
        employeId: utilisateur.employe.id,
        dateCreation: {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà pointé aujourd’hui' }, { status: 400 });
    }

    // Création de la présence
    const nouvellePresence = await prisma.presence.create({
      data: {
        employeId: utilisateur.employe.id,
        dateCreation: new Date(date),
        statut,
        heureArrivee: statut === 'Present' ? heureArrivee || null : null,
        heureDepart: statut === 'Present' ? heureDepart || null : null,
      },
    });

    // NOTIFICATION AUTOMATIQUE
    const messages: Record<string, string> = {
      Present: `Vous avez pointé **Présent** ${heureArrivee ? `à ${heureArrivee}` : ''}`,
      Absent: 'Vous avez déclaré une **Absence**',
      Conge: 'Vous avez déclaré un **Congé**',
      Maladie: 'Vous avez signalé une **Maladie**',
      Retard: 'Vous avez signalé un **Retard**',
      AbsentSansJustification: 'Vous avez été marqué **Absent sans justification**',
    };

    await prisma.notification.create({
      data: {
        utilisateurId: utilisateur.id,
        message: messages[statut] || `Présence enregistrée : ${statut}`,
        lien: '/dashboard/historique-presences',
      },
    });

    return NextResponse.json(
      { message: 'Présence enregistrée avec succès !', presence: nouvellePresence },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erreur POST presence:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}