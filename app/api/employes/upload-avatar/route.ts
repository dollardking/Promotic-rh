import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const token = authHeader.split(' ')[1];
  const formData = await req.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${decoded.id}-${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(process.cwd(), 'public/uploads/avatars', filename);
    await writeFile(filepath, buffer);

    const photoUrl = `/uploads/avatars/${filename}`;

    await prisma.employe.update({
      where: { utilisateurId: decoded.id },
      data: { photoUrl },
    });

    return NextResponse.json({ photoUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Échec upload' }, { status: 500 });
  }
}