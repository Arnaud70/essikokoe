import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { CreateRapportDto } from '../dtos/create-rapport.dto';
import { CreateBilanDto } from '../dtos/create-bilan.dto';

@Injectable()
export class ComptabiliteService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== TRANSACTIONS =====
  
  async createTransaction(dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        typeTransaction: dto.typeTransaction,
        categorie: dto.categorie,
        description: dto.description,
        montant: dto.montant,
        reference: dto.reference,
        venteId: dto.venteId,
      },
    });

    return { message: 'Transaction créée', transaction };
  }

  async getTransactions(type?: string) {
    const where: any = {};
    if (type) where.typeTransaction = type;

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  }

  async getTransactionById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { idTransaction: id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} non trouvée`);
    }

    return transaction;
  }

  // ===== RAPPORTS =====
  
  async getRapports() {
    return this.prisma.rapport.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createRapport(dto: CreateRapportDto) {
    const rapport = await this.prisma.rapport.create({
      data: {
        typeRapport: dto.typeRapport,
        periode: dto.periode,
        donneesStatistiques: dto.donneesStatistiques,
      },
    });

    return { message: 'Rapport créé', rapport };
  }

  // ===== BILAN =====
  
  async getBilans() {
    return this.prisma.bilan.findMany({
      orderBy: { exercice: 'desc' }
    });
  }

  async createBilan(dto: CreateBilanDto) {
    const bilan = await this.prisma.bilan.create({
      data: {
        exercice: dto.exercice,
        actifImmobilise: dto.actifImmobilise || 0,
        actifCirculant: dto.actifCirculant || 0,
        totalActif: dto.totalActif || 0,
        capitauxPropres: dto.capitauxPropres || 0,
        dettes: dto.dettes || 0,
        totalPassif: dto.totalPassif || 0,
        generePar: dto.generePar,
      },
    });

    return { message: 'Bilan créé', bilan };
  }

  // ===== AUDIT =====
  
  async getAudit() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }
}