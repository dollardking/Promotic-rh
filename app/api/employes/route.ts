// app/api/employes/route.ts
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };
    if (!['rh', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const utilisateurs = await prisma.utilisateur.findMany({
      where: { role: { in: ['employe', 'rh', 'admin'] } },
      include: { employe: true },
    });

    const employes = utilisateurs.map(u => ({
      id: u.id,
      nom: u.employe?.nom ?? '',
      prenom: u.employe?.prenom ?? '',
      email: u.email,
      role: u.role,
    }));

    // **IMPORTANT** : toujours renvoyer un objet JSON valide
    return NextResponse.json({ employes }, { status: 200 });
  } catch (err) {
    console.error('Erreur JWT / DB :', err);
    return NextResponse.json({ error: 'Token invalide ou erreur serveur' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}