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

    const utilisateurs = await prisma.utilisateur.findMany({
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json({ utilisateurs }, { status: 200 });
  } catch (error) {
    console.error('Erreur JWT:', error);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}