// lib/rapportGenerator.ts
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const prisma = new PrismaClient();

export async function getStats() {
  try {
    // 1. Employés (sauf admin) → via Employe + Utilisateur
    const employes = await prisma.employe.findMany({
      where: {
        utilisateur: { role: { not: 'admin' } },
        actif: true,
      },
      select: {
        nom: true,
        prenom: true,
        utilisateur: { select: { role: true } },
      },
      orderBy: { nom: 'asc' },
    }).then(emps => emps.map(e => ({
      nom: e.nom,
      prenom: e.prenom,
      role: e.utilisateur.role,
    })));

    // 2. Départements
    const departements = await prisma.departement.findMany({
      select: { nomDepartement: true, description: true },
      orderBy: { nomDepartement: 'asc' },
    });

    // 3. Présences / Absences (ce mois-ci)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [presences, absences] = await Promise.all([
      prisma.presence.count({
        where: {
          heureArrivee: { gte: startOfMonth, lte: endOfMonth },
          statut: 'Present',
        },
      }),
      prisma.presence.count({
        where: {
          heureArrivee: { gte: startOfMonth, lte: endOfMonth },
          statut: { in: ['Absent', 'AbsentSansJustification'] },
        },
      }),
    ]);

    // 4. Salaires (mois en cours)
    const salaires = await prisma.salaire.findMany({
      where: {
        mois: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        employe: {
          select: { nom: true, prenom: true },
        },
      },
      orderBy: { employe: { nom: 'asc' } },
    });

    const totalBrut = salaires.reduce((sum, s) => sum + s.salaireBase + s.primes, 0);
    const totalDeduction = salaires.reduce((sum, s) => sum + s.deductions, 0);
    const totalNet = totalBrut - totalDeduction;

    return {
      employes,
      departements,
      presences,
      absences,
      salaires,
      totalBrut,
      totalDeduction,
      totalNet,
      mois: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    };
  } catch (err) {
    console.error('Erreur getStats:', err);
    return {
      employes: [],
      departements: [],
      presences: 0,
      absences: 0,
      salaires: [],
      totalBrut: 0,
      totalDeduction: 0,
      totalNet: 0,
      mois: 'Erreur de chargement',
    };
  }
}

// PDF & Excel → inchangés (juste utiliser les bonnes données)
export async function generatePDF(stats: any) {
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      { text: 'Rapport RH - Promotic', style: 'header', alignment: 'center' },
      { text: `Mois: ${stats.mois}`, style: 'subheader', alignment: 'center', margin: [0, 10] },

      // Employés
      { text: `Employés inscrits (${stats.employes.length})`, style: 'section', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto'],
          body: [
            [{ text: 'Nom', bold: true }, { text: 'Prénom', bold: true }, { text: 'Rôle', bold: true }],
            ...stats.employes.map((e: any) => [e.nom, e.prenom, e.role]),
          ],
        },
        layout: 'lightHorizontalLines',
      },

      // Départements
      { text: `Départements créés (${stats.departements.length})`, style: 'section', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Nom', bold: true }, { text: 'Description', bold: true }],
            ...stats.departements.map((d: any) => [
              d.nomDepartement,
              d.description || 'Aucune description',
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
      },

      // Présences
      { text: 'Présences & Absences', style: 'section', margin: [0, 20, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Présences ce mois-ci', stats.presences],
            ['Absences ce mois-ci', stats.absences],
          ],
        },
        layout: 'lightHorizontalLines',
      },

      // Salaires
      { text: 'Détail des salaires', style: 'section', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Nom', bold: true },
              { text: 'Prénom', bold: true },
              { text: 'Base', bold: true },
              { text: 'Primes', bold: true },
              { text: 'Déductions', bold: true },
              { text: 'Net', bold: true },
            ],
            ...stats.salaires.map((s: any) => [
              s.employe.nom,
              s.employe.prenom,
              s.salaireBase.toFixed(2),
              s.primes.toFixed(2),
              `-${s.deductions.toFixed(2)}`,
              (s.salaireBase + s.primes - s.deductions).toFixed(2),
            ]),
            [
              { text: 'TOTAUX', colSpan: 2, bold: true },
              {},
              stats.totalBrut.toFixed(2),
              '',
              `-${stats.totalDeduction.toFixed(2)}`,
              stats.totalNet.toFixed(2),
            ],
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      header: { fontSize: 24, bold: true, margin: [0, 0, 0, 20] },
      subheader: { fontSize: 16, italic: true },
      section: { fontSize: 18, bold: true, color: '#5D3FD3' },
    },
  };

  return new Promise<{ buffer: Buffer; filename: string }>((resolve) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer: Buffer) => {
      resolve({ buffer, filename: `rapport-rh-${Date.now()}.pdf` });
    });
  });
}

export async function generateExcel(stats: any) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Rapport RH');

  sheet.addRow(['Rapport RH - Promotic']);
  sheet.addRow([`Mois: ${stats.mois}`]);
  sheet.addRow([]);

  sheet.addRow([`Employés inscrits (${stats.employes.length})`]);
  sheet.addRow(['Nom', 'Prénom', 'Rôle']);
  stats.employes.forEach((e: any) => sheet.addRow([e.nom, e.prenom, e.role]));
  sheet.addRow([]);

  sheet.addRow([`Départements créés (${stats.departements.length})`]);
  sheet.addRow(['Nom', 'Description']);
  stats.departements.forEach((d: any) =>
    sheet.addRow([d.nomDepartement, d.description || 'Aucune'])
  );
  sheet.addRow([]);

  sheet.addRow(['Présences & Absences']);
  sheet.addRow(['Type', 'Nombre']);
  sheet.addRow(['Présences', stats.presences]);
  sheet.addRow(['Absences', stats.absences]);
  sheet.addRow([]);

  sheet.addRow(['Détail des salaires']);
  sheet.addRow(['Nom', 'Prénom', 'Base', 'Primes', 'Déductions', 'Net']);
  stats.salaires.forEach((s: any) => {
    sheet.addRow([
      s.employe.nom,
      s.employe.prenom,
      s.salaireBase,
      s.primes,
      s.deductions,
      s.salaireBase + s.primes - s.deductions,
    ]);
  });
  sheet.addRow(['TOTAUX', '', stats.totalBrut, '', stats.totalDeduction, stats.totalNet]);

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer, filename: `rapport-rh-${Date.now()}.xlsx` };
}