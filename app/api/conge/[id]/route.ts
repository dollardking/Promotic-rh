// app/api/conge/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const params = await context.params;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { id: number; role: string };
    if (!['rh', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { status } = await req.json();
    if (!['Approuvé', 'Rejeté'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const conge = await prisma.conge.findUnique({
      where: { id },
      include: { utilisateur: { include: { employe: true } } },
    });

    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    const updatedConge = await prisma.conge.update({
      where: { id },
      data: { status },
      include: { utilisateur: { include: { employe: true } } },
    });

    const employe = updatedConge.utilisateur.employe;

    // NOTIFICATION RH : PAS DE LIEN → ON NE MET PAS `lien`
    await prisma.notification.create({
      data: {
        utilisateurId: decoded.id,
        message: `Vous avez répondu à ${employe?.prenom || 'Inconnu'} ${employe?.nom || 'Inconnu'} pour une demande de ${conge.type} (${status.toLowerCase()}).`,
        lu: false,
        // lien: null → ON NE LE MET PAS DU TOUT
      },
    });

    // NOTIFICATION EMPLOYÉ : PAS DE LIEN
    await prisma.notification.create({
      data: {
        utilisateurId: conge.utilisateurId,
        message: `Votre demande de ${conge.type} (${new Date(conge.startDate).toLocaleDateString('fr-FR')} - ${new Date(conge.endDate).toLocaleDateString('fr-FR')}) a été ${status.toLowerCase()}.`,
        lu: false,
        // lien: null → ON NE LE MET PAS
      },
    });

    return NextResponse.json({ conge: updatedConge }, { status: 200 });
  } catch (err: any) {
    console.error('Erreur PATCH /api/conge/[id]:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}