// app/api/conge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };
    if (!['rh', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // UNIQUEMENT LES DEMANDES EN ATTENTE
    const conges = await prisma.conge.findMany({
      where: { status: 'En attente' }, // CORRIGÉ ICI
      include: {
        utilisateur: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = conges.map(c => ({
      id: c.id,
      utilisateurId: c.utilisateurId,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      type: c.type,
      status: c.status,
      reason: c.reason || '',
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ conges: formatted }, { status: 200 });
  } catch (err: any) {
    console.error('Erreur API /api/conge:', err);
    if (err.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}