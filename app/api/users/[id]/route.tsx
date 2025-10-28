import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    // Attendre les paramètres dynamiques
    const params = await context.params;
    if (parseInt(params.id) !== decoded.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { employe: true },
    });

    if (!utilisateur) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Masquer le mot de passe pour la réponse
    const { motDePasse, ...userData } = utilisateur;
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans PATCH:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom: string;
    };

    // Attendre les paramètres dynamiques
    const params = await context.params;
    if (parseInt(params.id) !== decoded.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { prenom, nom, email, motDePasse } = await req.json();

    const updatedData: any = { prenom, nom, email };
    if (motDePasse) {
      updatedData.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id: decoded.id },
      data: updatedData,
    });

    // Masquer le mot de passe pour la réponse
    const { motDePasse: _, ...userData } = utilisateur;
    return NextResponse.json({ message: 'Profil mis à jour avec succès', user: userData }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}