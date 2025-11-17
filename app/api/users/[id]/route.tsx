// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { id: number };

    const params = await context.params;
    if (Number(params.id) !== decoded.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur?.employe) {
      return NextResponse.json({ error: 'Profil employé non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.employe.prenom,
        nom: utilisateur.employe.nom,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/users/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { id: number };

    const params = await context.params;
    if (Number(params.id) !== decoded.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { prenom, nom, email, motDePasse } = await req.json();

    // Vérifie que l'employé existe
    const employe = await prisma.employe.findFirst({
      where: { utilisateurId: decoded.id },
    });

    if (!employe) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    // Mise à jour dans `employe` et `utilisateur`
    const [updatedEmploye, updatedUtilisateur] = await prisma.$transaction([
      prisma.employe.update({
        where: { id: employe.id },
        data: { prenom, nom },
      }),
      prisma.utilisateur.update({
        where: { id: decoded.id },
        data: {
          email,
          ...(motDePasse && { motDePasse: await bcrypt.hash(motDePasse, 10) }),
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUtilisateur.id,
        email: updatedUtilisateur.email,
        prenom: updatedEmploye.prenom,
        nom: updatedEmploye.nom,
      },
    });
  } catch (error: any) {
    console.error('Erreur PATCH /api/users/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}