// app/api/presences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { id: number };

    const { date, statut, heureArrivee, heureDepart } = await req.json();

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur?.employe?.id) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const employe = utilisateur.employe;

    const finalHeureArrivee = statut === 'Present' && heureArrivee
      ? new Date(`${date}T${heureArrivee}`)
      : new Date(`${date}T00:00:00`);

    const finalHeureDepart = heureDepart ? new Date(`${date}T${heureDepart}`) : null;

    const presence = await prisma.presence.create({
      data: {
        employeId: employe.id,
        dateCreation: new Date(date),
        statut,
        heureArrivee: finalHeureArrivee,
        heureDepart: finalHeureDepart,
      },
      include: { employe: true },
    });

    // NOTIFICATION EMPLOYÉ (avec lien)
    await prisma.notification.create({
      data: {
        utilisateurId: decoded.id,
        message: `Vous avez enregistré : ${statut} le ${new Date(date).toLocaleDateString('fr-FR')}.`,
        lu: false,
        lien: '/dashboard/historique-presences',
      },
    });

    // NOTIFICATION RH → LIEN VERS /dashboard/presences?employeId=ID
    const rhUsers = await prisma.utilisateur.findMany({
      where: { role: 'rh' },
    });

    for (const rh of rhUsers) {
      await prisma.notification.create({
        data: {
          utilisateurId: rh.id,
          message: `${employe.prenom} ${employe.nom} a enregistré : ${statut} le ${new Date(date).toLocaleDateString('fr-FR')}.`,
          lu: false,
          lien: `/dashboard/presences?employeId=${employe.id}`, // LIEN SPÉCIFIQUE
        },
      });
    }

    return NextResponse.json({ presence }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/presences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}