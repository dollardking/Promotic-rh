// app/api/rapports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getStats, generatePDF, generateExcel } from '../../../lib/rapportGenerator'; // NAMED IMPORT

const prisma = new PrismaClient();

async function getUser(token: string | null) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
  } catch {
    return null;
  }
}

async function notifyAdmin(message: string, lien: string) {
  try {
    const admins = await prisma.utilisateur.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: { utilisateurId: admin.id, message, lien, lu: false },
      });
    }
  } catch (err) {
    console.error('Erreur notification:', err);
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'rh') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const rapports = await prisma.rapport.findMany({
    where: { rhId: user.id },
    orderBy: { dateGeneration: 'desc' },
  });
  return NextResponse.json({ rapports });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] ?? null;
  const user = await getUser(token);
  if (!user || user.role !== 'rh') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { type } = await req.json();
  if (!['PDF', 'Excel'].includes(type)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 });

  try {
    // getStats est bien une fonction importée
    const stats = await getStats();

    const { buffer, filename } = type === 'PDF'
      ? await generatePDF(stats)
      : await generateExcel(stats);

    const rapport = await prisma.rapport.create({
      data: {
        type,
        contenu: Buffer.from(buffer),
        nomFichier: filename,
        taille: buffer.length,
        rhId: user.id,
        envoyeAAdmin: true,
      },
    });

    await notifyAdmin(
      `[RH] a envoyé un rapport ${type} : ${filename}`,
      `/admin-dashboard/rapports`
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': type === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur génération rapport:', error);
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}