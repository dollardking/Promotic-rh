import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Fonction de vérification du token (comme dans toutes tes autres APIs)
async function getUserFromToken(token: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string; prenom?: string; nom?: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUserFromToken(token);

  // Protection admin
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const [totalUtilisateurs, totalRh, totalEmployes, rapportsRecus] = await Promise.all([
      prisma.utilisateur.count(),
      prisma.utilisateur.count({ where: { role: 'rh' } }),
      prisma.utilisateur.count({ where: { role: 'employe' } }),
      prisma.rapport.count(), // ou une autre table si tu veux le vrai nombre
    ]);

    return NextResponse.json({
      stats: {
        totalUtilisateurs,
        totalRh,
        totalEmployes,
        rapportsRecus,
      },
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}