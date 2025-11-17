// app/api/departements/employe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Employe, Departement } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface RequestBody {
  departementId: number;
  employeId: number;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const body: RequestBody = await req.json();

  const { departementId, employeId } = body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (!['rh', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const employe = await prisma.employe.findUnique({ where: { id: employeId } });
    if (!employe || !employe.utilisateurId) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const departement = await prisma.departement.findUnique({ where: { id: departementId } });
    if (!departement) {
      return NextResponse.json({ error: 'Département non trouvé' }, { status: 404 });
    }

    const updated = await prisma.employe.update({
      where: { id: employeId },
      data: { departementId },
      include: { utilisateur: true, departement: true },
    });

    // Notification à l'employé
    await prisma.notification.create({
      data: {
        utilisateurId: employe.utilisateurId,
        message: `Vous avez été affecté au département : ${departement.nomDepartement}.`,
        lu: false,
      },
    });

    return NextResponse.json({
      employe: {
        id: updated.id,
        prenom: updated.prenom,
        nom: updated.nom,
        email: updated.email,
      },
    }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}