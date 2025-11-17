// app/api/salaire/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';

const prisma = new PrismaClient();

interface DecodedToken {
  id: number;
  role: 'rh' | 'employe' | 'admin';
  exp: number;
}

// Envoi de notification
const sendNotification = async (utilisateurId: number, message: string, lien?: string) => {
  await prisma.notification.create({
    data: {
      utilisateurId,
      message,
      lu: false,
      lien: lien || null,
    },
  });
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const body = await req.json();
  const { statut } = body;

  try {
    const salaire = await prisma.salaire.findUnique({
      where: { id: Number(id) },
      include: {
        employe: {
          include: { utilisateur: true },
        },
      },
    });

    if (!salaire) {
      return NextResponse.json({ error: 'Salaire non trouvé' }, { status: 404 });
    }

    // === VALIDATION RH ===
    if (decoded.role === 'rh' && statut === 'Payé') {
      const updated = await prisma.salaire.update({
        where: { id: Number(id) },
        data: { statut: 'Payé', datePaiement: new Date() },
        include: { employe: { include: { utilisateur: true } } },
      });

      const montant = (updated.salaireBase + updated.primes - updated.deductions).toFixed(2);
      const employeNom = `${updated.employe.prenom} ${updated.employe.nom}`;
      const moisStr = new Date(updated.mois).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

      // Notification RH
      await sendNotification(
        decoded.id,
        `Vous venez de valider un paiement de ${montant}€ à ${employeNom} pour ${moisStr}.`,
        `/rh-dashboard/salaires`
      );

      // Notification Employé
      if (updated.employe.utilisateur?.id) {
        await sendNotification(
          updated.employe.utilisateur.id,
          `Vous avez reçu un paiement de ${montant}€ pour ${moisStr}.`,
          `/dashboard/salaires`
        );
      }

      return NextResponse.json(
        { salaire: updated, message: 'Paiement validé et notifications envoyées !' },
        { status: 200 }
      );
    }

    // === CONFIRMATION EMPLOYÉ ===
    if (decoded.role === 'employe' && statut === 'Reçu') {
      if (salaire.employe.utilisateur?.id !== decoded.id) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const updated = await prisma.salaire.update({
        where: { id: Number(id) },
        data: { statut: 'Reçu' },
      });

      return NextResponse.json(
        { salaire: updated, message: 'Paiement confirmé !' },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
  } catch (error: any) {
    console.error('Erreur mise à jour salaire:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}