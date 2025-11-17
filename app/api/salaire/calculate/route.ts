// app/api/salaire/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';

const prisma = new PrismaClient();

interface DecodedToken {
  id: number;
  role: 'rh' | 'employe' | 'admin';
  exp: number;
}

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

  const { employeId, mois } = await req.json();

  if (!employeId || !mois) {
    return NextResponse.json({ error: 'employeId et mois requis' }, { status: 400 });
  }

  try {
    // Récupère le salaire de base depuis le dernier salaire ou un champ fictif
    // Puisque tu n'as pas de table `Contrat`, on va chercher dans `Salaire` ou on fixe une base
    const dernierSalaire = await prisma.salaire.findFirst({
      where: {
        employeId: Number(employeId),
      },
      orderBy: { mois: 'desc' },
    });

    const salaireBase = dernierSalaire?.salaireBase || 300000; // Valeur par défaut si aucun salaire
    const primes = 150;
    const deductions = 0;

    return NextResponse.json({
      salaireBase,
      primes,
      deductions,
    });
  } catch (error: any) {
    console.error('Erreur calcul salaire:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}