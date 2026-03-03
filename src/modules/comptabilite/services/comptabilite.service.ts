import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { CreateRapportDto } from '../dtos/create-rapport.dto';
import { CreateBilanDto } from '../dtos/create-bilan.dto';

@Injectable()
export class ComptabiliteService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== TRANSACTIONS =====
  
  async createTransaction(dto: CreateTransactionDto) {
    let venteIdToUse = dto.venteId;
    // Si une référence facture est fournie, utiliser la vente liée à la facture
    if (dto.reference) {
      const facture = await this.prisma.facture.findFirst({ where: { numeroFacture: dto.reference }, include: { vente: true } });
      if (facture && facture.venteId) {
        venteIdToUse = facture.venteId;
      }
    }
    // Si un venteId est à utiliser, vérifier qu'il existe
    if (venteIdToUse) {
      const vente = await this.prisma.vente.findUnique({ where: { idVente: venteIdToUse } });
      if (!vente) {
        throw new BadRequestException(`venteId introuvable: ${venteIdToUse}`);
      }
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        typeTransaction: dto.typeTransaction,
        categorie: dto.categorie,
        description: dto.description,
        montant: dto.montant,
        reference: dto.reference,
        ...(venteIdToUse ? { venteId: venteIdToUse } : {}),
      },
    });

    return { message: 'Transaction créée', transaction };
  }

  async getTransactions(type?: string) {
    const where: any = {};
    // Valider que le type est un enum valide (RECETTE ou DEPENSE)
    if (type && ['RECETTE', 'DEPENSE'].includes(type.toUpperCase())) {
      where.typeTransaction = type.toUpperCase();
    }

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

  async getDistributionByCategory() {
    const transactions = await this.prisma.transaction.findMany();

    const distribution = {
      recettes: {},
      depenses: {},
    };

    transactions.forEach((t) => {
      const type = t.typeTransaction === 'RECETTE' ? 'recettes' : 'depenses';
      if (!distribution[type][t.categorie]) {
        distribution[type][t.categorie] = 0;
      }
      distribution[type][t.categorie] += t.montant;
    });

    // Convertir en array pour affichage
    return {
      recettes: Object.entries(distribution.recettes).map(([categorie, montant]) => ({
        categorie,
        montant,
      })),
      depenses: Object.entries(distribution.depenses).map(([categorie, montant]) => ({
        categorie,
        montant,
      })),
    };
  }

  // RAPPORTS 
  
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

  async getBilanSummary() {
    // Récupérer les transactions
    const transactions = await this.prisma.transaction.findMany();
    
    // Récupérer le stock total
    const stock = await this.prisma.produit.findMany();
    const totalStock = stock.reduce((acc, p) => {
      // Calculer le stock actuel basé sur les mouvements
      return acc + (p.stockInitial * p.prixUnitaire);
    }, 0);

    // Calculer les actifs
    let tresorerie = 0;
    let creancesClients = 0;

    // Calculer basé sur les recettes/dépenses
    transactions.forEach((t) => {
      if (t.typeTransaction === 'RECETTE' && t.categorie === 'Ventes') {
        tresorerie += t.montant;
      } else if (t.typeTransaction === 'DEPENSE') {
        tresorerie -= t.montant;
      }
      if (t.categorie === 'Créances clients') {
        creancesClients += t.montant;
      }
    });

    const totalActifs = Math.max(0, tresorerie) + totalStock + creancesClients;

    // Calculer les passifs
    let dettesFournisseurs = 0;
    let chargesAPayer = 0;
    let capital = 2000000; // Valeur par défaut

    transactions.forEach((t) => {
      if (t.typeTransaction === 'DEPENSE') {
        if (t.categorie === 'Approvisionnement') {
          dettesFournisseurs += t.montant;
        } else if (t.categorie === 'Charges à payer' || t.categorie === 'Salaires') {
          chargesAPayer += t.montant;
        }
      }
    });

    const totalPassifs = dettesFournisseurs + chargesAPayer + capital;

    return {
      actifs: {
        tresorerie: Math.max(0, tresorerie),
        stock: totalStock,
        creancesClients,
        totalActifs,
      },
      passifs: {
        dettesFournisseurs,
        chargesAPayer,
        capital,
        totalPassifs,
      },
      resultat: totalActifs - totalPassifs,
    };
  }

  // ===== AUDIT =====
  
  async getAudit() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async getAuditStatus() {
    const transactions = await this.prisma.transaction.findMany();
    const bilanData = await this.getBilanSummary();

    const transactionsVerifiees = transactions.length;
    const detailsEcarts: any[] = [];

    // Vérifier si le bilan est équilibré
    const difference = bilanData.actifs.totalActifs - bilanData.passifs.totalPassifs;
    
    if (Math.abs(difference) > 0.01) {
      detailsEcarts.push({
        description: 'Déséquilibre du bilan',
        montant: Math.abs(difference),
        dateDetection: new Date(),
      });
    }

    const statut = detailsEcarts.length === 0 ? 'Conforme' : 'Non conforme';

    return {
      transactionsVerifiees,
      ecartsDetectes: detailsEcarts.length,
      statut,
      detailsEcarts,
    };
  }

  async verifyEquilibration() {
    const bilanData = await this.getBilanSummary();

    const totalActifs = bilanData.actifs.totalActifs;
    const totalPassifs = bilanData.passifs.totalPassifs;
    const difference = totalActifs - totalPassifs;

    return {
      totalActifs,
      totalPassifs,
      difference,
      equilibre: Math.abs(difference) < 0.01,
    };
  }

  async analyzeTrends() {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculer les totaux actuels
    let totalRecettes = 0;
    let totalDepenses = 0;

    transactions.forEach((t) => {
      if (t.typeTransaction === 'RECETTE') {
        totalRecettes += t.montant;
      } else {
        totalDepenses += t.montant;
      }
    });

    const resultatNet = totalRecettes - totalDepenses;

    // Analyser les tendances (basé sur les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionsRecentes = transactions.filter(
      (t) => new Date(t.createdAt) > thirtyDaysAgo
    );

    let recettesRecentes = 0;
    let depensesRecentes = 0;

    transactionsRecentes.forEach((t) => {
      if (t.typeTransaction === 'RECETTE') {
        recettesRecentes += t.montant;
      } else {
        depensesRecentes += t.montant;
      }
    });

    const tauxCroissance =
      totalRecettes > 0 ? ((recettesRecentes - totalRecettes) / totalRecettes) * 100 : 0;

    let tendance: 'Hausse' | 'Baisse' | 'Stable' = 'Stable';
    if (tauxCroissance > 5) tendance = 'Hausse';
    if (tauxCroissance < -5) tendance = 'Baisse';

    return {
      periode: '30 derniers jours',
      totalRecettes,
      totalDepenses,
      resultatNet,
      tauxCroissance: Math.round(tauxCroissance * 100) / 100,
      tendance,
    };
  }

  async generateAuditReport() {
    const auditStatus = await this.getAuditStatus();
    const equilibration = await this.verifyEquilibration();
    const trends = await this.analyzeTrends();
    const bilanData = await this.getBilanSummary();

    return {
      dateGeneration: new Date(),
      auditStatus,
      equilibration,
      trends,
      bilanData,
      recommandations: this.generateRecommandations(auditStatus, equilibration, trends),
    };
  }

  private generateRecommandations(
    auditStatus: any,
    equilibration: any,
    trends: any
  ): string[] {
    const recommandations: string[] = [];

    if (!equilibration.equilibre) {
      recommandations.push('Vérifier le déséquilibre du bilan détecté');
    }

    if (auditStatus.ecartsDetectes > 0) {
      recommandations.push('Analyser les écarts détectés et prendre des mesures correctives');
    }

    if (trends.tendance === 'Baisse') {
      recommandations.push('Analyser la baisse des recettes et prendre des mesures appropriées');
    }

    if (trends.totalDepenses > trends.totalRecettes * 0.8) {
      recommandations.push('Les dépenses approchent les recettes, contrôler les dépenses');
    }

    if (recommandations.length === 0) {
      recommandations.push('Situation financière saine, continuez le suivi régulier');
    }

    return recommandations;
  }
}