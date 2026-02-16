-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT', 'CLIENT');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('SACHET', 'BOUTEILLE', 'BONBONNE');

-- CreateEnum
CREATE TYPE "CommandeStatut" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'LIVREE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECETTE', 'DEPENSE');

-- CreateEnum
CREATE TYPE "RapportType" AS ENUM ('JOURNALIER', 'MENSUEL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('STOCK_FAIBLE', 'LIVRAISON_PREVUE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "idUtilisateur" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("idUtilisateur")
);

-- CreateTable
CREATE TABLE "clients" (
    "idClient" TEXT NOT NULL,
    "nomClient" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("idClient")
);

-- CreateTable
CREATE TABLE "produits" (
    "codeProduit" TEXT NOT NULL,
    "nomProduit" TEXT NOT NULL,
    "format" "Format" NOT NULL,
    "categorie" TEXT NOT NULL,
    "stockInitial" INTEGER NOT NULL,
    "stockMinimum" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "fournisseur" TEXT NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("codeProduit")
);

-- CreateTable
CREATE TABLE "commandes" (
    "idCommande" TEXT NOT NULL,
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "CommandeStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "clientId" TEXT NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("idCommande")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "idLigne" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "totalLigne" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("idLigne")
);

-- CreateTable
CREATE TABLE "ventes" (
    "idVente" TEXT NOT NULL,
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "modePaiement" TEXT NOT NULL,
    "commandeId" TEXT,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("idVente")
);

-- CreateTable
CREATE TABLE "factures" (
    "idFacture" TEXT NOT NULL,
    "numeroFacture" TEXT NOT NULL,
    "dateFacture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montant" DOUBLE PRECISION NOT NULL,
    "venteId" TEXT NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("idFacture")
);

-- CreateTable
CREATE TABLE "transactions" (
    "idTransaction" TEXT NOT NULL,
    "typeTransaction" "TransactionType" NOT NULL,
    "categorie" TEXT NOT NULL,
    "description" TEXT,
    "montant" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "venteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("idTransaction")
);

-- CreateTable
CREATE TABLE "rapports" (
    "idRapport" TEXT NOT NULL,
    "typeRapport" "RapportType" NOT NULL,
    "periode" TEXT NOT NULL,
    "donneesStatistiques" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapports_pkey" PRIMARY KEY ("idRapport")
);

-- CreateTable
CREATE TABLE "notifications" (
    "idNotification" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produitId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("idNotification")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ventes_commandeId_key" ON "ventes"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "factures_venteId_key" ON "factures"("venteId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_venteId_key" ON "transactions"("venteId");

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("idClient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("idCommande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("codeProduit") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("idCommande") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("idVente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("idVente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("codeProduit") ON DELETE SET NULL ON UPDATE CASCADE;
