// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// CETTE LIGNE EST OBLIGATOIRE DANS APP ROUTER
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const employe = await prisma.employe.findFirst({
      where: { utilisateurId: decoded.id },
      select: {
        prenom: true,
        nom: true,
        email: true,
        photoUrl: true,
        departement: { select: { nomDepartement: true } }
      }
    });

    if (!employe) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    // Gestion compatible conge OU demandeConge
    let congesEnAttente = 0;
    let permissionsEnAttente = 0;
    let totalApprouves = 0;

    try {
      const conges = await (prisma as any).conge.findMany({
        where: { employeId: employe.id },
        select: { type: true, statut: true }
      });
      if (conges) {
        congesEnAttente = conges.filter((c: any) => c.type === 'Congé' && c.statut === 'En attente').length;
        permissionsEnAttente = conges.filter((c: any) => c.type === 'Permission' && c.statut === 'En attente').length;
        totalApprouves = conges.filter((c: any) => c.statut === 'Approuvée').length;
      }
    } catch {
      const demandes = await (prisma as any).demandeConge?.findMany?.({
        where: { employe: { utilisateurId: decoded.id } },
        select: { type: true, statut: true }
      }) || [];
      congesEnAttente = demandes.filter((d: any) => d.type === 'Congé' && d.statut === 'En attente').length;
      permissionsEnAttente = demandes.filter((d: any) => d.type === 'Permission' && d.statut === 'En attente').length;
      totalApprouves = demandes.filter((d: any) => d.statut === 'Approuvée').length;
    }

    const presencesCeMois = await prisma.presence.count({
      where: { employeId: employe.id, dateCreation: { gte: debutMois }, statut: 'Present' }
    });

    const absencesCeMois = await prisma.presence.count({
      where: { employeId: employe.id, dateCreation: { gte: debutMois }, statut: { in: ['Absent', 'AbsentSansJustification'] } }
    });

    const salaires = await prisma.salaire.findMany({
      where: { employeId: employe.id, statut: 'Payé' },
      orderBy: { mois: 'desc' },
      take: 6,
      select: { salaireBase: true, primes: true, deductions: true, mois: true }
    });

    const salairesFormates = salaires.length > 0
      ? salaires.map(s => ({
          mois: new Date(s.mois).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          montant: Math.round((s.salaireBase || 0) + (s.primes || 0) - (s.deductions || 0))
        })).reverse()
      : [{ mois: 'Aucun', montant: 0 }];

    return NextResponse.json({
      employe,
      stats: {
        congesEnAttente,
        permissionsEnAttente,
        congesApprouves: totalApprouves,
        presencesCeMois,
        absencesCeMois,
        salairesDerniers6Mois: salairesFormates
      }
    });

  } catch (error: any) {
    console.error('Erreur API dashboard:', error.message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}