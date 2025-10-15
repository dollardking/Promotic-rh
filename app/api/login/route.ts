import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    // Récupérer l'utilisateur avec ses données d'employé
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: { employe: true }, // Inclure les données de l'employé pour récupérer le prénom
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.motDePasse);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    // Générer un token JWT avec les informations de l'utilisateur et de l'employé
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        prenom: user.employe?.prenom || user.email.split('@')[0] // Prénom depuis employé ou fallback
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: 'Connexion réussie', token }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}