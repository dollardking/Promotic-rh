// app/api/departement/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUser(token: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    return decoded;
  } catch {
    return null;
  }
}

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

// GET : Liste départements (Admin only)
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const departements = await prisma.departement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ departements });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer (Admin OU RH)
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || !['admin', 'rh'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { nomDepartement, description } = await req.json();
    if (!nomDepartement?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

    const nouveau = await prisma.departement.create({
      data: { nomDepartement, description: description || null },
    });

    // Notification bidirectionnelle
    const from = user.role === 'admin' ? 'Admin' : 'RH';
    const to = user.role === 'admin' ? 'rh' : 'admin';
    await notifyUsers(to, `[${from}] a ajouté le département : ${nomDepartement}`, '/admin-dashboard/departements');

    return NextResponse.json({ departement: nouveau }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur création' }, { status: 500 });
  }
}

// PATCH : Modifier (Admin only)
export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { id, nomDepartement, description } = await req.json();
    if (!id || !nomDepartement?.trim()) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });

    const updated = await prisma.departement.update({
      where: { id },
      data: { nomDepartement, description: description ?? null },
    });

    await notifyUsers('rh', `[Admin] a modifié le département : ${nomDepartement}`, '/admin-dashboard/departements');

    return NextResponse.json({ departement: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur modification' }, { status: 500 });
  }
}

// DELETE : Supprimer (Admin only)
export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const dept = await prisma.departement.findUnique({ where: { id } });
    if (!dept) return NextResponse.json({ error: 'Département introuvable' }, { status: 404 });

    await prisma.departement.delete({ where: { id } });

    await notifyUsers('rh', `[Admin] a supprimé le département : ${dept.nomDepartement}`, null);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur suppression' }, { status: 500 });
  }
}