// app/api/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

    const whereClause = decoded.role === 'rh' || decoded.role === 'admin'
      ? {}
      : { employe: { utilisateurId: decoded.id } };

    const permissions = await prisma.permission.findMany({
      where: whereClause,
      include: {
        employe: { select: { id: true, prenom: true, nom: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json({ permissions }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}