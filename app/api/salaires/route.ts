// app/api/params/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(token: string | null) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const user = await getUserFromToken(token);

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const employe = await prisma.employe.findFirst({
    where: { utilisateurId: user.id },
    select: {
      prenom: true,
      nom: true,
      email: true,
      telephone: true,  // ON RÉCUPÈRE LE TÉLÉPHONE
    },
  });

  if (!employe) return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });

  return NextResponse.json(employe);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const user = await getUserFromToken(token);

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { prenom, nom, email, telephone, motDePasse } = body;

  const updates: any = {};
  if (prenom) updates.prenom = prenom;
  if (nom) updates.nom = nom;
  if (email) updates.email = email;
  if (telephone !== undefined) updates.telephone = telephone; // ON SAUVEGARDE LE TÉLÉPHONE
  if (motDePasse) {
    const hashed = await bcrypt.hash(motDePasse, 10);
    updates.motDePasse = hashed;
  }

  const updated = await prisma.employe.update({
    where: { utilisateurId: user.id },
    data: updates,
  });

  return NextResponse.json({ message: 'Profil mis à jour avec succès !' });
}