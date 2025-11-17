// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const utilisateurs = await prisma.utilisateur.findMany({
      include: { employe: true },
      orderBy: { dateCreation: 'desc' },
    });

    const users = utilisateurs.map(u => ({
      id: u.id,
      email: u.email,
      prenom: u.employe?.prenom || 'Non défini',
      nom: u.employe?.nom || 'Non défini',
      role: u.role,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId, newRole } = await req.json();
    if (!['employe', 'rh', 'admin'].includes(newRole)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    await prisma.utilisateur.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}