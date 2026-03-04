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
   * 🔧 HELPER: Calculer le stock réel à partir des mouvements
   * Stock réel = stockInitial + (somme des ENTREES) - (somme des SORTIES)
   */
  private async calculateRealStock(codeProduit: string): Promise<number> {
    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit },
    });

    if (!produit) {
      throw new NotFoundException(
        `Produit avec code ${codeProduit} non trouvé`,
      );
    }

    const mouvements = await this.prisma.stockMovement.findMany({
      where: { codeProduit },
    });

    let stockReel = produit.stockInitial;
    mouvements.forEach((m) => {
      if (m.type === 'ENTREE') {
        stockReel += m.quantite;
      } else if (m.type === 'SORTIE') {
        stockReel -= m.quantite;
      }
    });

    return Math.max(0, stockReel); // Le stock ne peut pas être négatif
  }

  /**
   * 📥 ENREGISTREMENT D'ENTRÉE DE STOCK
   * Ajoute des unités au stock d'un produit (livraison, retour, etc.)
   * Crée un mouvement tracé dans StockMovement
   */
  async registerStockEntry(dto: CreateStockEntryDto, username: string): Promise<{
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

    // 🔴 NOUVEAU: Créer le mouvement de stock
    const mouvement = await this.prisma.stockMovement.create({
      data: {
        codeProduit: dto.codeProduit,
        type: 'ENTREE',
        quantite: dto.quantite,
        motif: dto.motif,
        createdBy: username,
      },
    });

    // Calculer le nouveau stock réel
    const nouveauStock = await this.calculateRealStock(dto.codeProduit);

    return {
      message: 'Entrée de stock enregistrée avec succès',
      codeProduit: dto.codeProduit,
      quantiteAjoutee: dto.quantite,
      nouveauStock,
    };
  }

  /**
   * 📤 DÉDUCTION AUTOMATIQUE APRÈS VENTE
   * Réduit le stock dès qu'une vente est confirmée
   * Crée un mouvement SORTIE tracé dans StockMovement
   */
  async deductStockAfterSale(dto: DeductStockDto, username: string): Promise<{
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
    const stockActuel = await this.calculateRealStock(dto.codeProduit);
    if (stockActuel < dto.quantite) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible: ${stockActuel}, Demandé: ${dto.quantite}`,
      );
    }

    // 🔴 NOUVEAU: Créer le mouvement de sortie
    await this.prisma.stockMovement.create({
      data: {
        codeProduit: dto.codeProduit,
        type: 'SORTIE',
        quantite: dto.quantite,
        motif: 'Vente',
        createdBy: username,
      },
    });

    // Calculer le nouveau stock réel
    const nouveauStock = await this.calculateRealStock(dto.codeProduit);

    // Vérifier si le stock est critique après déduction
    const estCritique = nouveauStock <= produit.stockMinimum;

    // Si critique, créer une notification
    if (estCritique) {
      await this.createStockAlertNotification(produit, nouveauStock);
    }

    return {
      message: 'Déduction de stock effectuée',
      codeProduit: dto.codeProduit,
      quantiteDeduite: dto.quantite,
      nouveauStock,
      estCritique,
    };
  }

  /**
   * 👁️ CONSULTATION DE L'INVENTAIRE
   * Retourne l'état complet du stock avec alertes visuelles
   * Stock calculé à partir des mouvements
   */
  async getInventory(): Promise<StockInventoryResponseDto> {
    const produits = await this.prisma.produit.findMany();

    const inventaire: StockInventoryDto[] = await Promise.all(
      produits.map(async (p) => {
        const stockActuel = await this.calculateRealStock(p.codeProduit);
        const estCritique = stockActuel <= p.stockMinimum;
        const pourcentageDisponibilité =
          stockActuel > 0
            ? Math.round((stockActuel / (stockActuel + p.stockMinimum)) * 100)
            : 0;

        return {
          codeProduit: p.codeProduit,
          nomProduit: p.nomProduit,
          format: p.format,
          stockActuel,
          stockMinimum: p.stockMinimum,
          prixUnitaire: p.prixUnitaire,
          estCritique,
          pourcentageDisponibilité,
        };
      }),
    );

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
   * Stock calculé à partir des mouvements
   */
  async getStockByFormat(): Promise<StockByFormatResponseDto> {
    const produits = await this.prisma.produit.findMany();

    const mapFormat = new Map<string, StockByFormatDto>();

    for (const p of produits) {
      const stockActuel = await this.calculateRealStock(p.codeProduit);
      const format = p.format;
      const existing = mapFormat.get(format) || {
        format,
        quantite: 0,
        nombreProduits: 0,
        valeurTotale: 0,
      };

      existing.quantite += stockActuel;
      existing.nombreProduits += 1;
      existing.valeurTotale += stockActuel * p.prixUnitaire;

      mapFormat.set(format, existing);
    }

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
    stockActuel: number,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        type: 'STOCK_FAIBLE',
        message: `⚠️ Stock critique pour ${produit.nomProduit} (Code: ${produit.codeProduit}). Stock actuel: ${stockActuel}, Minimum: ${produit.stockMinimum}`,
        produitId: produit.codeProduit,
      },
    });
  }

  /**
   * 📈 ANALYTICS POUR DASHBOARD
   * Utilise le stock réel calculé à partir des mouvements
   */
  async getStockDashboardMetrics(): Promise<{
    stockTotal: number;
    valeurTotalStock: number;
    produitsEnAlerte: number;
    distribuitionParFormat: Record<string, number>;
    tauxCouverture: number; // % de produits > stockMinimum
  }> {
    const produits = await this.prisma.produit.findMany();

    let stockTotal = 0;
    let valeurTotalStock = 0;
    let produitsEnAlerte = 0;
    const distribuitionParFormat = {};

    for (const p of produits) {
      const stockActuel = await this.calculateRealStock(p.codeProduit);
      stockTotal += stockActuel;
      valeurTotalStock += stockActuel * p.prixUnitaire;

      if (stockActuel <= p.stockMinimum) {
        produitsEnAlerte++;
      }

      distribuitionParFormat[p.format] =
        (distribuitionParFormat[p.format] || 0) + stockActuel;
    }

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

  /**
   *  HISTORIQUE DES MOUVEMENTS DE STOCK
   */
  async getStockMovementHistory(limit: number = 100): Promise<any> {
    // Convertir en entier et borner entre 1 et 1000
    const limitInt = Math.max(1, Math.min(parseInt(String(limit), 10) || 100, 1000));

    const mouvements = await this.prisma.stockMovement.findMany({
      include: {
        produit: {
          select: {
            codeProduit: true,
            nomProduit: true,
            format: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limitInt,
    });

    const historique = mouvements.map((m) => ({
      id: m.id,
      date: m.createdAt,
      produit: `${m.produit.nomProduit} - ${this.getFormatLabel(m.produit.format)}`,
      codeProduit: m.codeProduit,
      type: m.type === 'ENTREE' ? '+' : '-',
      typeLabel: m.type,
      quantite: m.quantite,
      motif: m.motif,
      reference: m.id.substring(0, 8).toUpperCase(), // Simuler une référence
      utilisateur: m.createdBy || 'System',
    }));

    return {
      total: historique.length,
      mouvements: historique,
    };
  }

  /**
   * 🔧 HELPER: Obtenir le label du format
   */
  private getFormatLabel(format: string): string {
    const labels = {
      SACHET: 'Sachet',
      BOUTEILLE: 'Bouteille 1.5L',
      BONBONNE: 'Bonbonne',
    };
    return labels[format] || format;
  }
}
