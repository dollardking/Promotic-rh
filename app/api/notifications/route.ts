import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans GET:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    await prisma.$connect();
    const notifications = await prisma.notification.findMany({
      where: { utilisateurId: decoded.id },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des notifications:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Votre session a expiré, veuillez vous reconnecter' }, { status: 401 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P1001') {
      return NextResponse.json({ error: 'Impossible de se connecter à la base de données. Vérifiez que le serveur est en marche sur localhost:5432.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des notifications' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}