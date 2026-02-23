-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT');

-- CreateTable
CREATE TABLE "bilans" (
    "idBilan" TEXT NOT NULL,
    "exercice" TEXT NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actifImmobilise" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actifCirculant" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalActif" DOUBLE PRECISION NOT NULL,
    "capitauxPropres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dettes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPassif" DOUBLE PRECISION NOT NULL,
    "generePar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bilans_pkey" PRIMARY KEY ("idBilan")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "idAudit" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entite" TEXT NOT NULL,
    "idEntite" TEXT NOT NULL,
    "userId" TEXT,
    "ancienValeurs" JSONB,
    "nouveauValeurs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("idAudit")
);
