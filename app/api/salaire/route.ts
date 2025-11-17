// app/api/salaire/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';

const prisma = new PrismaClient();

interface DecodedToken {
  id: number;
  role: 'rh' | 'employe' | 'admin';
  exp: number;
}

// === POST : Créer un salaire (rh uniquement) ===
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let decoded: DecodedToken;

  try {
    decoded = jwtDecode(token);
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  if (decoded.exp * 1000 < Date.now()) {
    return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
  }

  if (decoded.role !== 'rh') {
    return NextResponse.json({ error: 'Accès refusé : rh requis' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      employeId: employeIdStr,
      salaireBase,
      primes,
      deductions,
      mois,
      datePaiement,
      statut = 'En attente de validation',
    } = body;

    const employeId = Number(employeIdStr);
    if (isNaN(employeId) || employeId <= 0) {
      return NextResponse.json({ error: 'employeId invalide' }, { status: 400 });
    }

    const salaire = await prisma.salaire.create({
      data: {
        employeId,
        salaireBase: Number(salaireBase),
        primes: Number(primes),
        deductions: Number(deductions),
        mois: new Date(mois),
        datePaiement: datePaiement ? new Date(datePaiement) : null,
        statut,
      },
    });

    return NextResponse.json({ salaire }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création salaire:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// === GET : Lister les salaires (rh = tous, employe = ses salaires) ===
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let decoded: DecodedToken;

  try {
    decoded = jwtDecode(token);
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  if (decoded.exp * 1000 < Date.now()) {
    return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
  }

  try {
    let salaires;

    if (decoded.role === 'rh') {
      salaires = await prisma.salaire.findMany({
        include: {
          employe: {
            select: { id: true, prenom: true, nom: true, email: true },
          },
        },
        orderBy: { mois: 'desc' },
      });
    } else if (decoded.role === 'employe') {
      salaires = await prisma.salaire.findMany({
        where: { employeId: decoded.id },
        orderBy: { mois: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Rôle non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ salaires });
  } catch (error: any) {
    console.error('Erreur récupération salaires:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}