// app/api/employes/profil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const employe = await prisma.employe.findFirst({
      where: { utilisateurId: decoded.id },
      include: {
        departement: { select: { nomDepartement: true } },
      },
    });

    if (!employe) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ employe }, { status: 200 });
  } catch (error) {
    console.error('Token invalide:', error);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const body = await req.json();
  const {
    prenom,
    nom,
    email,
    motDePasse,
    telephone,
    dateEmbauche,
    dateDepart,
    competences
  } = body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    // 1. Trouver l'employé
    const employe = await prisma.employe.findFirst({
      where: { utilisateurId: decoded.id },
      include: { utilisateur: true },
    });

    if (!employe) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // 2. Mettre à jour l'employé
    const updatedEmploye = await prisma.employe.update({
      where: { id: employe.id },
      data: {
        prenom,
        nom,
        email,
        telephone: telephone || employe.telephone,
        dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : employe.dateEmbauche,
        dateDepart: dateDepart ? new Date(dateDepart) : employe.dateDepart,
        competences: competences || employe.competences,
      },
    });

    // 3. Mettre à jour l'utilisateur (email + mot de passe)
    const userData: any = {
      email,
    };

    if (motDePasse) {
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      userData.motDePasse = hashedPassword;
    }

    const updatedUtilisateur = await prisma.utilisateur.update({
      where: { id: decoded.id },
      data: userData,
    });

    return NextResponse.json({
      message: 'Profil mis à jour avec succès !',
      employe: updatedEmploye,
      utilisateur: {
        email: updatedUtilisateur.email
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: error.message || 'Échec mise à jour' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}