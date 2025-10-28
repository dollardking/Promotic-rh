import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Gestion des départements
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

    const departements = await prisma.departement.findMany();
    return NextResponse.json({ departements }, { status: 200 });
  } catch (error) {
    console.error('Erreur JWT ou récupération:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
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

    const { nomDepartement, description } = await req.json();
    if (!nomDepartement) {
      return NextResponse.json({ error: 'Le nom du département est requis' }, { status: 400 });
    }
    const departement = await prisma.departement.create({
      data: {
        nomDepartement,
        description: description || null,
      },
    });
    return NextResponse.json({ departement }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Gestion des préférences utilisateur
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const id = parseInt(params.id);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string, id: number };
    if (decoded.role !== 'rh' && decoded.role !== 'admin' && decoded.id !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        prefs: true,
      },
    });
    if (!utilisateur) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    const prefs = utilisateur.prefs || { langue: 'fr', notificationsActives: true };
    return NextResponse.json({ prefs }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string, id: number };
    if (decoded.role !== 'rh' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { utilisateurId, langue, notificationsActives } = await req.json();
    if (utilisateurId !== decoded.id && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        prefs: { langue, notificationsActives },
      },
    });
    return NextResponse.json({ prefs: utilisateur.prefs }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}