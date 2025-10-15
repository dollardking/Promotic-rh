-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Employe',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "employeId" INTEGER,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employe" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "dateEmbauche" TIMESTAMP(3),
    "dateDepart" TIMESTAMP(3),
    "competences" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "utilisateurId" INTEGER,
    "departementId" INTEGER,

    CONSTRAINT "Employe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departement" (
    "id" SERIAL NOT NULL,
    "nomDepartement" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Departement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conge" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Pending',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" TIMESTAMP(3) NOT NULL,
    "heureFin" TIMESTAMP(3),
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Pending',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "heureArrivee" TIMESTAMP(3) NOT NULL,
    "heureDepart" TIMESTAMP(3),
    "trajet" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'Present',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salaire" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "salaireBase" DOUBLE PRECISION NOT NULL,
    "primes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mois" TIMESTAMP(3) NOT NULL,
    "datePaiement" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'En attente',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Salaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rapport" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PDF',
    "contenu" TEXT,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_employeId_key" ON "Utilisateur"("employeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employe_matricule_key" ON "Employe"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Employe_email_key" ON "Employe"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employe_utilisateurId_key" ON "Employe"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Departement_nomDepartement_key" ON "Departement"("nomDepartement");

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conge" ADD CONSTRAINT "Conge_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salaire" ADD CONSTRAINT "Salaire_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
