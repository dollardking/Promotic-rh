// app/api/presences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

    // RH/admin = tout voir
    // Employé = ses propres présences
    const whereClause = decoded.role === 'rh' || decoded.role === 'admin'
      ? {}
      : { employe: { utilisateurId: decoded.id } };

    const presences = await prisma.presence.findMany({
      where: whereClause,
      include: {
        employe: { select: { id: true, prenom: true, nom: true, email: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json({ presences }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}