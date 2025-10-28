import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans POST:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    const { startDate, endDate, type, reason, status, utilisateurId } = await req.json();

    if (!startDate || !endDate || !type || !reason || !utilisateurId) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const conge = await prisma.conge.create({
      data: {
        utilisateurId: utilisateurId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        status: status || 'En attente',
        reason,
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
          message: `Nouvelle demande de ${type} soumise par ${decoded.prenom || 'un employé'} (${decoded.email}) - Du ${new Date(startDate).toLocaleDateString()} au ${new Date(endDate).toLocaleDateString()}`,
          lu: false,
          lien: '/rh-dashboard/conge',
        },
      });
    }

    await prisma.notification.create({
      data: {
        utilisateurId: decoded.id,
        message: '✅ Votre demande a été envoyée avec succès. Patientez pendant que nous la traitons !',
        lu: false,
        lien: '/dashboard/mes-demandes',
      },
    });

    return NextResponse.json({ message: 'Demande de congé soumise avec succès', conge }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du congé:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Votre session a expiré, veuillez vous reconnecter' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur lors de la création de la demande de congé' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

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

    const conges = await prisma.conge.findMany({
      where: { utilisateurId: decoded.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ conges }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des congés:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Votre session a expiré, veuillez vous reconnecter' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur lors de la récupération des demandes de congé' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans DELETE:', token, 'ID:', params.id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    const id = parseInt(params.id);
    const conge = await prisma.conge.findUnique({
      where: { id, utilisateurId: decoded.id },
    });

    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée ou non autorisée' }, { status: 404 });
    }

    if (conge.status === 'En attente') {
      await prisma.conge.delete({
        where: { id },
      });
      await prisma.notification.deleteMany({
        where: {
          utilisateurId: decoded.id,
          lien: '/dashboard/mes-demandes',
          message: { contains: '✅ Votre demande a été envoyée' },
        },
      });
      return NextResponse.json({ message: 'Votre demande a été annulée avec succès' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Seules les demandes en attente peuvent être annulées' }, { status: 400 });
    }
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token Bearer requis' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu dans PUT:', token, 'ID:', params.id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
      role: string;
      prenom?: string;
    };

    const id = parseInt(params.id);
    const { startDate, endDate, type, reason } = await req.json();

    const conge = await prisma.conge.findUnique({
      where: { id, utilisateurId: decoded.id },
    });

    if (!conge) {
      return NextResponse.json({ error: 'Demande non trouvée ou non autorisée' }, { status: 404 });
    }

    if (conge.status !== 'En attente') {
      return NextResponse.json({ error: 'Seules les demandes en attente peuvent être modifiées' }, { status: 400 });
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