// app/api/rh-dashboard/route.ts
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

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);

  if (!user || user.role !== 'rh') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const [
      totalEmployes,           // SEULS LES EMPLOYÉS (pas admin ni RH)
      totalDepartements,
      congesEnAttente,
      congesApprouves,
      congesRejetes,
      presentsAujourdHui,
      absentsAujourdHui,
      rapportsGeneres,
      salairesParMoisRaw,
    ] = await Promise.all([
      // Nouveau count : uniquement les utilisateurs avec role = 'employe
      prisma.utilisateur.count({
        where: { role: 'employe' }
      }),

      prisma.departement.count(),

      prisma.conge.count({ where: { status: 'En attente' } }),
      prisma.conge.count({ where: { status: 'Approuvé' } }),
      prisma.conge.count({ where: { status: 'Rejeté' } }),

      prisma.presence.count({
        where: {
          dateCreation: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          statut: 'Present',
        },
      }),
      prisma.presence.count({
        where: {
          dateCreation: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          statut: { in: ['Absent', 'AbsentSansJustification', 'Conge'] },
        },
      }),

      prisma.rapport.count({ where: { rhId: user.id } }),

      prisma.$queryRaw`
        SELECT 
          TO_CHAR("mois", 'Mon YYYY') as "mois",
          COALESCE(SUM("salaireBase" + COALESCE("primes", 0) - COALESCE("deductions", 0)), 0)::bigint as "total"
        FROM "Salaire" 
        WHERE "statut" = 'Payé'
          AND "mois" >= date_trunc('month', CURRENT_DATE - interval '11 months')
        GROUP BY date_trunc('month', "mois"), TO_CHAR("mois", 'Mon YYYY')
        ORDER BY date_trunc('month', "mois")
      `
    ]);

    const salairesParMois = Array.isArray(salairesParMoisRaw)
      ? salairesParMoisRaw.map((row: any) => ({
          mois: row.mois,
          total: Number(row.total) || 0
        }))
      : [];

    return NextResponse.json({
      user: {
        prenom: user.prenom || 'RH',
        nom: user.nom || '',
        role: 'RH'
      },
      stats: {
        totalEmployes,                    // maintenant = vrai nombre d'employés
        totalDepartements,
        congesEnAttente,
        congesApprouves,
        congesRejetes,
        presentsAujourdHui,
        absentsAujourdHui,
        rapportsGeneres,
        salairesParMois
      }
    });

  } catch (error) {
    console.error('Erreur API RH Dashboard:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}