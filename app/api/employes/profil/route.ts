// app/api/employes/profil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // LE BON CHAMP DANS LE TOKEN EST `id`
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const employe = await prisma.employe.findFirst({
      where: { utilisateurId: decoded.id }, // ← ICI : `decoded.id`
      include: {
        departement: { select: { nomDepartement: true } },
      },
    });

    if (!employe) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ employe }, { status: 200 });
  } catch (error) {
    console.error('Token invalide:', error);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { telephone, dateEmbauche, dateDepart, competences } = await req.json();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const updated = await prisma.employe.update({
      where: { utilisateurId: decoded.id },
      data: {
        telephone,
        dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : null,
        dateDepart: dateDepart ? new Date(dateDepart) : null,
        competences,
      },
    });

    return NextResponse.json({ employe: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Échec mise à jour' }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}