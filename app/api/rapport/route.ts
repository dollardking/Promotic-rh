// app/api/rapport/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUser(token: string | null) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
  } catch {
    return null;
  }
}

// GET : Liste des rapports envoyés au Admin
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const rapports = await prisma.rapport.findMany({
      where: { envoyeAAdmin: true },
      include: {
        rh: {
          include: {
            employe: {
              select: { prenom: true, nom: true },
            },
          },
        },
      },
      orderBy: { dateGeneration: 'desc' },
    });

    // Formater les données pour le frontend
    const formatted = rapports.map(r => ({
      id: r.id,
      type: r.type,
      nomFichier: r.nomFichier,
      dateGeneration: r.dateGeneration.toISOString(),
      rh: {
        prenom: r.rh.employe?.prenom || 'Inconnu',
        nom: r.rh.employe?.nom || 'Inconnu',
      },
    }));

    return NextResponse.json({ rapports: formatted });
  } catch (error: any) {
    console.error('Erreur GET rapports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur: ' + error.message },
      { status: 500 }
    );
  }
}

// POST : Télécharger un rapport spécifique
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const rapport = await prisma.rapport.findUnique({
      where: { id },
    });

    if (!rapport || !rapport.contenu) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
    }

    const mime = rapport.type === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new NextResponse(rapport.contenu, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${rapport.nomFichier}"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur POST rapport:', error);
    return NextResponse.json(
      { error: 'Erreur téléchargement: ' + error.message },
      { status: 500 }
    );
  }
}