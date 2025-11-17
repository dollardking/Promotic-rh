// app/api/departements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Departement, Employe } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface DepartementWithEmployes extends Departement {
  employes: Pick<Employe, 'id' | 'prenom' | 'nom' | 'email'>[];
}

// Fonction pour envoyer des notifications
async function notifyUsers(roleToNotify: 'admin' | 'rh', message: string, lien: string | null = null) {
  try {
    const users = await prisma.utilisateur.findMany({
      where: { role: roleToNotify },
      select: { id: true },
    });
    for (const user of users) {
      await prisma.notification.create({
        data: {
          utilisateurId: user.id,
          message,
          lien,
          lu: false,
        },
      });
    }
  } catch (err) {
    console.error('Erreur envoi notification:', err);
  }
}

async function getUser(token: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET : Liste départements avec employés (RH)
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'rh') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const departements: DepartementWithEmployes[] = await prisma.departement.findMany({
      include: {
        employes: {
          where: { actif: true },
          select: { id: true, prenom: true, nom: true, email: true },
        },
      },
    });
    return NextResponse.json({ departements }, { status: 200 });
  } catch (error: unknown) {
    console.error('Erreur départements:', error);
    return NextResponse.json({ error: 'Serveur indisponible' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST : Créer département (RH)
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'rh') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { nomDepartement, description } = await req.json();
    if (!nomDepartement?.trim()) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    }

    const departement = await prisma.departement.create({
      data: { nomDepartement, description: description || null },
    });

    // NOTIFICATION VERS ADMIN
    await notifyUsers('admin', `[RH] a ajouté le département : ${nomDepartement}`, '/admin-dashboard/departements');

    return NextResponse.json({ departement }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce département existe déjà' }, { status: 400 });
    }
    console.error('Erreur création département:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}