// app/api/employes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JwtPayload {
  role: string;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!['rh', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const employes = await prisma.employe.findMany({
      where: { actif: true },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
      },
    });

    return NextResponse.json({ employes }, { status: 200 });
  } catch (error) {
    console.error('Erreur /api/employes:', error);
    return NextResponse.json({ error: 'Serveur indisponible' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}