import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const id = parseInt(params.id);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string; id: number };
    if (decoded.role !== 'rh' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const conge = await prisma.conge.findUnique({ where: { id } });
    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    const utilisateur = await prisma.utilisateur.findUnique({ where: { id: conge.utilisateurId } });

    // Notification pour le RH
    await prisma.notification.create({
      data: {
        utilisateurId: decoded.id,
        message: `Vous avez ouvert les détails de la demande de ${utilisateur?.prenom} ${utilisateur?.nom} (${conge.type}).`,
        lu: false,
        lien: `/rh-dashboard/conges?id=${conge.id}`,
      },
    });

    // Notification pour l'employé
    await prisma.notification.create({
      data: {
        utilisateurId: conge.utilisateurId,
        message: `Le RH a consulté votre demande de ${conge.type} (${conge.startDate.toISOString().split('T')[0]} - ${conge.endDate.toISOString().split('T')[0]}).`,
        lu: false,
        lien: '/dashboard/mes-demandes',
      },
    });

    return NextResponse.json({ message: 'Notifications envoyées' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}