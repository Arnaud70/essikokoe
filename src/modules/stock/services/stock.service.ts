import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateStockEntryDto } from '../dtos/create-stock-entry.dto';
import { DeductStockDto } from '../dtos/deduct-stock.dto';
import {
  StockInventoryResponseDto,
  StockInventoryDto,
} from '../dtos/stock-inventory.dto';
import {
  StockByFormatResponseDto,
  StockByFormatDto,
} from '../dtos/stock-by-format.dto';
import {
  StockMovementResponseDto,
  StockMovementDto,
} from '../dtos/stock-movement.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📥 ENREGISTREMENT D'ENTRÉE DE STOCK
   * Ajoute des unités au stock d'un produit (livraison, retour, etc.)
   */
  async registerStockEntry(dto: CreateStockEntryDto): Promise<{
    message: string;
    codeProduit: string;
    quantiteAjoutee: number;
    nouveauStock: number;
  }> {
    // Vérifier que le produit existe
    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit: dto.codeProduit },
    });

    if (!produit) {
      throw new NotFoundException(
        `Produit avec code ${dto.codeProduit} non trouvé`,
      );
    }

    // Vérifier que le format correspond
    if (produit.format !== dto.format) {
      throw new BadRequestException(
        `Format fourni (${dto.format}) ne correspond pas au produit (${produit.format})`,
      );
    }

    // Nœud dynamique : un produit peut avoir un stock initial, on le met à jour
    const nouveauStock = produit.stockInitial + dto.quantite;

    // Mettre à jour le stock initial du produit
    const updated = await this.prisma.produit.update({
      where: { codeProduit: dto.codeProduit },
      data: { stockInitial: nouveauStock },
    });

    // Enregistrer le mouvement dans la table de logs (optionnel, si you have a StockMovement table)
    // await this.prisma.stockMovement.create({ ... });

    return {
      message: 'Entrée de stock enregistrée avec succès',
      codeProduit: dto.codeProduit,
      quantiteAjoutee: dto.quantite,
      nouveauStock: updated.stockInitial,
    };
  }

  /**
   * 📤 DÉDUCTION AUTOMATIQUE APRÈS VENTE
   * Réduit le stock dès qu'une vente est confirmée
   */
  async deductStockAfterSale(dto: DeductStockDto): Promise<{
    message: string;
    codeProduit: string;
    quantiteDeduite: number;
    nouveauStock: number;
    estCritique: boolean;
  }> {
    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit: dto.codeProduit },
    });

    if (!produit) {
      throw new NotFoundException(
        `Produit avec code ${dto.codeProduit} non trouvé`,
      );
    }

    // Vérifier qu'il y a assez de stock
    if (produit.stockInitial < dto.quantite) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible: ${produit.stockInitial}, Demandé: ${dto.quantite}`,
      );
    }

    const nouveauStock = produit.stockInitial - dto.quantite;

    // Mettre à jour le stock
    const updated = await this.prisma.produit.update({
      where: { codeProduit: dto.codeProduit },
      data: { stockInitial: nouveauStock },
    });

    // Vérifier si le stock est critique après déduction
    const estCritique = updated.stockInitial <= updated.stockMinimum;

    // Si critique, créer une notification
    if (estCritique) {
      await this.createStockAlertNotification(updated);
    }

    return {
      message: 'Déduction de stock effectuée',
      codeProduit: dto.codeProduit,
      quantiteDeduite: dto.quantite,
      nouveauStock: updated.stockInitial,
      estCritique,
    };
  }

  /**
   * 👁️ CONSULTATION DE L'INVENTAIRE
   * Retourne l'état complet du stock avec alertes visuelles
   */
  async getInventory(): Promise<StockInventoryResponseDto> {
    const produits = await this.prisma.produit.findMany();

    const inventaire: StockInventoryDto[] = produits.map((p) => {
      const estCritique = p.stockInitial <= p.stockMinimum;
      const pourcentageDisponibilité =
        p.stockInitial > 0
          ? Math.round((p.stockInitial / (p.stockInitial + p.stockMinimum)) * 100)
          : 0;

      return {
        codeProduit: p.codeProduit,
        nomProduit: p.nomProduit,
        format: p.format,
        stockActuel: p.stockInitial,
        stockMinimum: p.stockMinimum,
        prixUnitaire: p.prixUnitaire,
        estCritique,
        pourcentageDisponibilité,
      };
    });

    const produitsEnAlerte = inventaire.filter((inv) => inv.estCritique).length;
    const stockTotal = inventaire.reduce((acc, inv) => acc + inv.stockActuel, 0);

    return {
      totalProduits: produits.length,
      stockTotal,
      produitsEnAlerte,
      inventaire,
    };
  }

  /**
   * 📊 SUIVI PAR TYPE DE PRODUIT (SACHET / BOUTEILLE / BONBONNE)
   */
  async getStockByFormat(): Promise<StockByFormatResponseDto> {
    const produits = await this.prisma.produit.findMany();

    const mapFormat = new Map<string, StockByFormatDto>();

    produits.forEach((p) => {
      const format = p.format;
      const existing = mapFormat.get(format) || {
        format,
        quantite: 0,
        nombreProduits: 0,
        valeurTotale: 0,
      };

      existing.quantite += p.stockInitial;
      existing.nombreProduits += 1;
      existing.valeurTotale += p.stockInitial * p.prixUnitaire;

      mapFormat.set(format, existing);
    });

    const parFormat = Array.from(mapFormat.values());
    const totalUnites = parFormat.reduce((acc, f) => acc + f.quantite, 0);
    const valeurTotalStock = parFormat.reduce(
      (acc, f) => acc + f.valeurTotale,
      0,
    );

    return {
      parFormat,
      totalUnites,
      valeurTotalStock,
    };
  }

  /**
   * 🔔 DÉTECTION DE SEUILS CRITIQUES
   * Retourne les produits avec stock <= stockMinimum
   */
  async getCriticalStocks(): Promise<{
    produitsEnAlerte: StockInventoryDto[];
    nombreAlertes: number;
  }> {
    const inventory = await this.getInventory();
    const produitsEnAlerte = inventory.inventaire.filter(
      (inv) => inv.estCritique,
    );

    return {
      produitsEnAlerte,
      nombreAlertes: produitsEnAlerte.length,
    };
  }

  /**
   * 🔔 CRÉER UNE NOTIFICATION AUTOMATIQUE
   */
  private async createStockAlertNotification(
    produit: any,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        type: 'STOCK_FAIBLE',
        message: `⚠️ Stock critique pour ${produit.nomProduit} (Code: ${produit.codeProduit}). Stock actuel: ${produit.stockInitial}, Minimum: ${produit.stockMinimum}`,
        produitId: produit.codeProduit,
      },
    });
  }

  /**
   * 📈 ANALYTICS POUR DASHBOARD
   */
  async getStockDashboardMetrics(): Promise<{
    stockTotal: number;
    valeurTotalStock: number;
    produitsEnAlerte: number;
    distribuitionParFormat: Record<string, number>;
    tauxCouverture: number; // % de produits > stockMinimum
  }> {
    const produits = await this.prisma.produit.findMany();

    const stockTotal = produits.reduce((acc, p) => acc + p.stockInitial, 0);
    const valeurTotalStock = produits.reduce(
      (acc, p) => acc + p.stockInitial * p.prixUnitaire,
      0,
    );
    const produitsEnAlerte = produits.filter(
      (p) => p.stockInitial <= p.stockMinimum,
    ).length;

    const distribuitionParFormat = {};
    produits.forEach((p) => {
      distribuitionParFormat[p.format] = (distribuitionParFormat[p.format] || 0) + p.stockInitial;
    });

    const tauxCouverture =
      produits.length > 0
        ? Math.round(
            ((produits.length - produitsEnAlerte) / produits.length) * 100,
          )
        : 0;

    return {
      stockTotal,
      valeurTotalStock,
      produitsEnAlerte,
      distribuitionParFormat,
      tauxCouverture,
    };
  }
}
