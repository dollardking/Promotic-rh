import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Attend les paramètres asynchrones
    const params = await context.params;
    const id = parseInt(params.id);
    console.log('Token reçu dans GET pour un congé:', token, 'ID:', id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    const conge = await prisma.conge.findUnique({
      where: { id, utilisateurId: decoded.id },
    });

    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée ou non autorisée' }, { status: 404 });
    }

    // Convertir les dates en objets Date si elles sont des chaînes
    const responseConge = {
      ...conge,
      startDate: conge.startDate instanceof Date ? conge.startDate : new Date(conge.startDate),
      endDate: conge.endDate instanceof Date ? conge.endDate : new Date(conge.endDate),
    };

    return NextResponse.json({ conge: responseConge }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du congé:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Votre session a expiré, veuillez vous reconnecter' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur lors de la récupération de la demande' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Attend les paramètres asynchrones
    const params = await context.params;
    const id = parseInt(params.id);
    console.log('Token reçu dans PUT:', token, 'ID:', id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    const { startDate, endDate, type, reason } = await req.json();

    const conge = await prisma.conge.findUnique({
      where: { id, utilisateurId: decoded.id },
    });

    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée ou non autorisée' }, { status: 404 });
    }

    const updatedConge = await prisma.conge.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : conge.startDate,
        endDate: endDate ? new Date(endDate) : conge.endDate,
        type: type || conge.type,
        reason: reason || conge.reason,
      },
    });

    const rhUser = await prisma.utilisateur.findFirst({
      where: { role: 'rh' },
    });
    const rhId = rhUser?.id;

    if (rhId) {
      await prisma.notification.create({
        data: {
          utilisateurId: rhId,
          message: `La demande de ${decoded.prenom || 'un employé'} (${decoded.email}) a été modifiée - Du ${new Date(updatedConge.startDate).toLocaleDateString()} au ${new Date(updatedConge.endDate).toLocaleDateString()}`,
          lu: false,
          lien: '/rh-dashboard/conge',
        },
      });
    }

    await prisma.notification.create({
      data: {
        utilisateurId: decoded.id,
        message: '✅ Votre demande a été modifiée avec succès.',
        lu: false,
        lien: '/dashboard/mes-demandes',
      },
    });

    return NextResponse.json({ message: 'Votre demande a été modifiée avec succès', conge: updatedConge }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la modification du congé:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Votre session a expiré, veuillez vous reconnecter' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur lors de la modification de la demande' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans DELETE:', token);

    // Attend les paramètres asynchrones
    const params = await context.params;
    const id = parseInt(params.id);
    console.log('ID à supprimer:', id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    const conge = await prisma.conge.findUnique({
      where: { id, utilisateurId: decoded.id },
    });

    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée ou non autorisée' }, { status: 404 });
    }

    // Supprimer la demande
    await prisma.conge.delete({
      where: { id },
    });

    // Supprimer la notification associée à l'utilisateur
    await prisma.notification.deleteMany({
      where: {
        utilisateurId: decoded.id,
        lien: '/dashboard/mes-demandes',
        message: { contains: '✅ Votre demande a été envoyée' },
      },
    });

    return NextResponse.json({ message: 'Votre demande a été annulée avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du congé:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Votre session a expiré, veuillez vous reconnecter' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur lors de la suppression de la demande' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}