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

    const notifications = await prisma.notification.findMany({
      include: { utilisateur: true }, // Inclure les données de l'utilisateur
    });
    return NextResponse.json({ notifications }, { status: 200 });
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

    const { utilisateurId, message, lien } = await req.json();
    const notification = await prisma.notification.create({
      data: {
        utilisateurId,
        message,
        lu: false,
        lien: lien || null,
      },
    });
    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const id = parseInt(params.id);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };
    if (decoded.role !== 'rh' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { lu } = await req.json();
    const notification = await prisma.notification.update({
      where: { id },
      data: { lu: !!lu },
    });
    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}