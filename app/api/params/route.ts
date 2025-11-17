// app/api/params/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // ← CHANGÉ : bcryptjs au lieu de bcrypt

const prisma = new PrismaClient();

async function getUser(token: string | null) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: user.id },
      include: { employe: { select: { nom: true, prenom: true } } },
    });

    if (!utilisateur) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    return NextResponse.json({
      email: utilisateur.email,
      nom: utilisateur.employe?.nom || '',
      prenom: utilisateur.employe?.prenom || '',
    });
  } catch (error) {
    console.error('Erreur GET params:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { nom, prenom, email, motDePasse } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const updateData: any = { email };
    if (motDePasse) {
      const hash = await bcrypt.hash(motDePasse, 10); // ← bcryptjs fonctionne ici
      updateData.motDePasse = hash;
    }

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: updateData,
    });

    if (nom || prenom) {
      await prisma.employe.upsert({
        where: { utilisateurId: user.id },
        update: { nom, prenom },
        create: {
          utilisateurId: user.id,
          nom: nom || '',
          prenom: prenom || '',
          matricule: `EMP-${Date.now()}`,
          email: email,
        },
      });
    }

    return NextResponse.json({ message: 'Paramètres mis à jour avec succès' });
  } catch (error: any) {
    console.error('Erreur POST params:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}