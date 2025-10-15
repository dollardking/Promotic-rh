import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 });
    }

    const user = await prisma.utilisateur.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token invalide ou expiré.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        motDePasse: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès.' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json({ error: 'Erreur lors de la réinitialisation.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}