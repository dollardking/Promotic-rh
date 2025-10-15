import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { env } from 'process';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'L\'email est requis.' }, { status: 400 });
    }

    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    // Générer un token de réinitialisation (valable 1 heure)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token et son expiration dans la base de données
    await prisma.utilisateur.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Configurer le transporteur nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    // Envoyer l'email
    const resetLink = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">Réinitialiser le mot de passe</a>
        <p>Ce lien expire dans 1 heure.</p>
      `,
    });

    return NextResponse.json({ message: 'Email de réinitialisation envoyé.' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}