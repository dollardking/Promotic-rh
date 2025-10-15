import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, password, confirmPassword } = await req.json();

    // Validation des champs
    if (!nom || !prenom || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur et employé
    const user = await prisma.utilisateur.create({
      data: {
        email,
        motDePasse: hashedPassword,
        role: 'employe',
        employe: {
          create: {
            matricule: `EMP${Date.now()}`,
            nom,
            prenom,
            email,
            actif: true,
          },
        },
      },
      include: { employe: true }, // Inclure les données de l'employé
    });

    // Générer un token JWT avec une vérification du prénom
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        prenom: user.employe?.prenom || prenom // Utilise prenom de l'input si employe est null
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: 'Inscription réussie', token }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'inscription.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}