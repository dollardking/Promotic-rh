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

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Génération d'un dump SQL complet via Prisma (très propre)
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    let dump = `-- PROMOTIC TOGO - Sauvegarde complète - ${new Date().toISOString()}\n\n`;

    for (const { tablename } of tables) {
      if (tablename.startsWith('prisma_')) continue; // skip migrations

      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${tablename}"`);
      if (rows.length === 0) continue;

      dump += `-- Table: ${tablename}\n`;
      for (const row of rows) {
        const values = Object.values(row)
          .map(v => (v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`))
          .join(', ');
        const columns = Object.keys(row).join(', ');
        dump += `INSERT INTO "${tablename}" (${columns}) VALUES (${values});\n`;
      }
      dump += '\n';
    }

    return new NextResponse(dump, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename=promotic-togo-${new Date().toISOString().slice(0,10)}.sql`,
      },
    });
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}