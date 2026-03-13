import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateStockEntryDto } from '../dtos/create-stock-entry.dto';
import { DeductStockDto } from '../dtos/deduct-stock.dto';
import { TransferStockDto } from '../dtos/transfer-stock.dto';
import {
  StockInventoryResponseDto,
  StockInventoryDto,
} from '../dtos/stock-inventory.dto';
import {
  StockByFormatResponseDto,
  StockByFormatDto,
} from '../dtos/stock-by-format.dto';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) { }

  private async getDepotCentralId(): Promise<string> {
    const depot = await (this.prisma as any).magasin.findFirst({
      where: { nomMagasin: 'Dépôt Central' },
    });
    if (!depot) {
      // Si le dépôt n'existe pas encore (premier lancement), on en crée un
      const newDepot = await (this.prisma as any).magasin.create({
        data: { nomMagasin: 'Dépôt Central', emplacement: 'Lomé' }
      });
      return newDepot.idMagasin;
    }
    return depot.idMagasin;
  }

  /**
   * 📥 ENREGISTREMENT D'ENTRÉE DE STOCK (AJOUT INITIAL)
   */
  async registerStockEntry(dto: CreateStockEntryDto, user: any): Promise<any> {
    const magasinId = user.role === 'SUPERADMIN' ? (dto as any).magasinId : user.magasinId;
    if (!magasinId) throw new BadRequestException('ID du magasin requis');

    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit: dto.codeProduit },
    });

    if (!produit) throw new NotFoundException(`Produit ${dto.codeProduit} non trouvé`);

    const result = await this.prisma.$transaction(async (tx) => {
      const stock = await (tx as any).stock.upsert({
        where: { produitId_magasinId: { produitId: dto.codeProduit, magasinId } },
        update: { quantite: { increment: dto.quantite } },
        create: { produitId: dto.codeProduit, magasinId, quantite: dto.quantite },
      });

      await (tx as any).stockMovement.create({
        data: {
          codeProduit: dto.codeProduit,
          type: StockMovementType.ENTREE,
          quantite: dto.quantite,
          magasinId: magasinId,
          motif: dto.motif,
          createdBy: user.email,
        },
      });

      return stock;
    });

    return {
      message: 'Entrée de stock enregistrée avec succès',
      codeProduit: dto.codeProduit,
      quantiteAjoutee: dto.quantite,
      nouveauStock: result.quantite,
    };
  }

  /**
   * 🔄 TRANSFERT DE STOCK (DISTRIBUTION ENTRE MAGASINS)
   * Réservé au SUPERADMIN
   */
  async transferStock(dto: TransferStockDto, user: any): Promise<any> {
    const { codeProduit, quantite, destinationMagasinId, motif } = dto;
    let { sourceMagasinId } = dto;

    if (!sourceMagasinId) {
      sourceMagasinId = await this.getDepotCentralId();
    }

    if (sourceMagasinId === destinationMagasinId) {
      throw new BadRequestException('Le magasin source et destination doivent être différents');
    }

    // 1. Vérifier le stock source
    const sourceStock = await (this.prisma as any).stock.findUnique({
      where: { produitId_magasinId: { produitId: codeProduit, magasinId: sourceMagasinId } },
    });

    if (!sourceStock || sourceStock.quantite < quantite) {
      throw new BadRequestException('Stock source insuffisant pour le transfert');
    }

    // 2. Exécuter le transfert atomique
    return await this.prisma.$transaction(async (tx) => {
      // Déduire du magasin source
      const updatedSource = await (tx as any).stock.update({
        where: { idStock: sourceStock.idStock },
        data: { quantite: { decrement: quantite } },
      });

      // Ajouter au magasin destination (ou créer si n'existe pas)
      const updatedDest = await (tx as any).stock.upsert({
        where: { produitId_magasinId: { produitId: codeProduit, magasinId: destinationMagasinId } },
        update: { quantite: { increment: quantite } },
        create: { produitId: codeProduit, magasinId: destinationMagasinId, quantite },
      });

      // Tracer le transfert
      const transfer = await (tx as any).stockTransfer.create({
        data: {
          produitId: codeProduit,
          sourceMagasinId,
          destinationMagasinId,
          quantite,
          motif: motif || 'Distribution de stock',
          userId: user.id || user.sub || user.idUtilisateur,
        },
      });

      // Enregistrer les mouvements de stock détaillés
      await (tx as any).stockMovement.createMany({
        data: [
          {
            codeProduit,
            type: StockMovementType.SORTIE,
            quantite,
            magasinId: sourceMagasinId,
            motif: `Transfert vers magasin ${destinationMagasinId}`,
            createdBy: user.email,
          },
          {
            codeProduit,
            type: StockMovementType.ENTREE,
            quantite,
            magasinId: destinationMagasinId,
            motif: `Réception de magasin ${sourceMagasinId}`,
            createdBy: user.email,
          },
        ],
      });

      return {
        message: 'Transfert effectué avec succès',
        transferId: transfer.id,
        stockSource: updatedSource.quantite,
        stockDestination: updatedDest.quantite,
      };
    });
  }

  /**
   * 📜 HISTORIQUE DES TRANSFERTS
   */
  async getTransferHistory(user: any): Promise<any> {
    const where: any = {};
    if (user.role !== 'SUPERADMIN') {
      where.OR = [
        { sourceMagasinId: user.magasinId },
        { destinationMagasinId: user.magasinId },
      ];
    }

    return (this.prisma as any).stockTransfer.findMany({
      where,
      include: {
        produit: true,
        sourceMagasin: true,
        destinationMagasin: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * 📤 DÉDUCTION DE STOCK (VENTE)
   */
  async deductStock(dto: DeductStockDto, user: any): Promise<any> {
    const magasinId = user.role === 'SUPERADMIN' ? (dto as any).magasinId : user.magasinId;
    if (!magasinId) throw new BadRequestException('ID du magasin requis');

    const stock = await (this.prisma as any).stock.findUnique({
      where: { produitId_magasinId: { produitId: dto.codeProduit, magasinId } },
    });

    if (!stock || stock.quantite < dto.quantite) {
      throw new BadRequestException('Stock insuffisant');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedStock = await (tx as any).stock.update({
        where: { idStock: stock.idStock },
        data: { quantite: { decrement: dto.quantite } },
      });

      await (tx as any).stockMovement.create({
        data: {
          codeProduit: dto.codeProduit,
          type: StockMovementType.SORTIE,
          quantite: dto.quantite,
          magasinId: magasinId,
          motif: 'Vente',
          createdBy: user.email,
        },
      });

      return updatedStock;
    });

    return {
      message: 'Stock déduit avec succès',
      codeProduit: dto.codeProduit,
      nouveauStock: result.quantite,
    };
  }

  /**
   * 👁️ CONSULTATION DE L'INVENTAIRE (FILTRÉ PAR MAGASIN)
   */
  async getInventory(user: any): Promise<StockInventoryResponseDto> {
    const where: any = {};
    if (user.role !== 'SUPERADMIN' && user.magasinId) {
      where.magasinId = user.magasinId;
    }

    const stocks = await (this.prisma as any).stock.findMany({
      where,
      include: { produit: true },
    });

    const inventaire: StockInventoryDto[] = stocks.map((s) => ({
      codeProduit: s.produitId,
      nomProduit: s.produit.nomProduit,
      format: s.produit.format,
      stockActuel: s.quantite,
      stockMinimum: (s.produit as any).stockMinimum || 0,
      prixUnitaire: s.produit.prixUnitaire,
      estCritique: s.quantite <= ((s.produit as any).stockMinimum || 0),
      pourcentageDisponibilité: 100,
    }));

    return {
      totalProduits: inventaire.length,
      stockTotal: inventaire.reduce((acc, inv) => acc + inv.stockActuel, 0),
      produitsEnAlerte: inventaire.filter((inv) => inv.estCritique).length,
      inventaire,
    };
  }

  /**
   * 📊 STOCK PAR FORMAT
   */
  async getStockByFormat(user: any): Promise<StockByFormatResponseDto> {
    const inventory = await this.getInventory(user);
    const mapFormat = new Map<string, StockByFormatDto>();

    for (const item of inventory.inventaire) {
      const existing = mapFormat.get(item.format) || {
        format: item.format,
        quantite: 0,
        nombreProduits: 0,
        valeurTotale: 0,
      };

      existing.quantite += item.stockActuel;
      existing.nombreProduits += 1;
      existing.valeurTotale += item.stockActuel * item.prixUnitaire;

      mapFormat.set(item.format, existing);
    }

    const parFormat = Array.from(mapFormat.values());
    return {
      parFormat,
      totalUnites: parFormat.reduce((acc, f) => acc + f.quantite, 0),
      valeurTotalStock: parFormat.reduce((acc, f) => acc + f.valeurTotale, 0),
    };
  }

  async getCriticalStocks(user: any): Promise<any> {
    const inventory = await this.getInventory(user);
    const produitsEnAlerte = inventory.inventaire.filter((inv) => inv.estCritique);
    return { produitsEnAlerte, nombreAlertes: produitsEnAlerte.length };
  }

  async getStockDashboardMetrics(user: any): Promise<any> {
    const inventory = await this.getInventory(user);
    const distribution = {};
    inventory.inventaire.forEach(inv => {
      distribution[inv.format] = (distribution[inv.format] || 0) + inv.stockActuel;
    });

    return {
      stockTotal: inventory.stockTotal,
      valeurTotalStock: inventory.inventaire.reduce((acc, inv) => acc + (inv.stockActuel * inv.prixUnitaire), 0),
      produitsEnAlerte: inventory.produitsEnAlerte,
      distribuitionParFormat: distribution,
      tauxCouverture: inventory.totalProduits > 0 ? Math.round(((inventory.totalProduits - inventory.produitsEnAlerte) / inventory.totalProduits) * 100) : 0,
    };
  }

  async getStockMovementHistory(user: any, limit: number = 100): Promise<any> {
    const where: any = {};
    if (user.role !== 'SUPERADMIN' && user.magasinId) {
      where.magasinId = user.magasinId;
    }

    const mouvements = await (this.prisma as any).stockMovement.findMany({
      where,
      include: { produit: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      total: mouvements.length,
      mouvements: mouvements.map(m => ({
        id: m.id,
        date: m.createdAt,
        produit: m.produit.nomProduit,
        type: m.type === 'ENTREE' ? '+' : '-',
        quantite: m.quantite,
        motif: m.motif,
        utilisateur: m.createdBy,
      })),
    };
  }
}
