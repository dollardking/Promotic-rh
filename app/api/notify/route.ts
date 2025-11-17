// app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserId(token: string | null): Promise<number | null> {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const notifs = await prisma.notification.findMany({
    where: { utilisateurId: userId },
    orderBy: { dateCreation: 'desc' },
  });

  return NextResponse.json({ notifications: notifs });
}