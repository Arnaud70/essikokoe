import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProduitDto } from '../dtos/create-produit.dto';
import { UpdateProduitDto } from '../dtos/update-produit.dto';
import { ProduitListResponseDto } from '../dtos/produit.dto';
import { ProduitsByFormatResponseDto } from '../dtos/produits-by-format.dto';

@Injectable()
export class ProduitsService {
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

    return Math.max(0, stockReel);
  }

  /**
   * 🔧 HELPER: Déterminer le statut du produit
   */
  private getStatut(stock: number, stockMinimum: number): string {
    return stock < stockMinimum ? 'Stock Faible' : 'En stock';
  }

  /**
   * 🔧 HELPER: Mapper un produit vers le DTO avec stock et statut
   */
  private async mapProduitToDto(produit: any): Promise<any> {
    const stock = await this.calculateRealStock(produit.codeProduit);
    const statut = this.getStatut(stock, produit.stockMinimum);

    return {
      codeProduit: produit.codeProduit,
      nomProduit: produit.nomProduit,
      format: produit.format,
      stock: stock,
      statut: statut,
      prixUnitaire: produit.prixUnitaire,
      fournisseur: produit.fournisseur,
    };
  }

  /**
   * 🆕 CRÉER UN NOUVEAU PRODUIT
   */
  async createProduit(dto: CreateProduitDto): Promise<{
    message: string;
    produit: any;
  }> {
    // Générer automatiquement le code du produit
    const count = await this.prisma.produit.count();
    const codeProduit = `PROD-${String(count + 1).padStart(3, '0')}`;

    const produit = await this.prisma.produit.create({
      data: {
        codeProduit: codeProduit,
        nomProduit: dto.nomProduit,
        format: dto.format,
        categorie: dto.categorie,
        stockInitial: dto.stockInitial,
        stockMinimum: dto.stockMinimum,
        prixUnitaire: dto.prixUnitaire,
        fournisseur: dto.fournisseur,
      },
    });

    return {
      message: 'Produit créé avec succès',
      produit,
    };
  }

  /**
   * 📖 RÉCUPÉRER UN PRODUIT PAR CODE
   */
  async getProduitByCode(codeProduit: string): Promise<any> {
    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit },
    });

    if (!produit) {
      throw new NotFoundException(
        `Produit avec code ${codeProduit} non trouvé`,
      );
    }

    return produit;
  }

  /**
   * 📋 LISTER TOUS LES PRODUITS
   */
  async getAllProduits(): Promise<ProduitListResponseDto> {
    const produits = await this.prisma.produit.findMany({
      orderBy: { codeProduit: 'asc' },
    });

    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  /**
   * 🔍 RECHERCHER DES PRODUITS PAR NOM OU CODE
   */
  async searchProduits(query: string): Promise<ProduitListResponseDto> {
    const produits = await this.prisma.produit.findMany({
      where: {
        OR: [
          { codeProduit: { contains: query, mode: 'insensitive' } },
          { nomProduit: { contains: query, mode: 'insensitive' } },
          { fournisseur: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  /**
   * 🏷️ FILTRER PAR FORMAT (SACHET, BOUTEILLE, BONBONNE)
   */
  async getProduitsByFormat(format: string): Promise<ProduitListResponseDto> {
    const formatUppper = format.toUpperCase() as any;
    const produits = await this.prisma.produit.findMany({
      where: { format: formatUppper },
      orderBy: { nomProduit: 'asc' },
    });

    if (produits.length === 0) {
      throw new NotFoundException(
        `Aucun produit trouvé au format ${format}`,
      );
    }

    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  /**
   * 📊 STATISTIQUES PAR FORMAT
   */
  async getStatsByFormat(): Promise<ProduitsByFormatResponseDto> {
    const produits = await this.prisma.produit.findMany();

    const mapFormat = new Map<string, any>();

    produits.forEach((p) => {
      const format = p.format;
      const existing = mapFormat.get(format) || {
        format,
        totalPrix: 0,
        count: 0,
      };

      existing.totalPrix += p.prixUnitaire;
      existing.count += 1;

      mapFormat.set(format, existing);
    });

    const parFormat = Array.from(mapFormat.values()).map((item) => ({
      format: item.format,
      nombreProduits: item.count,
      prixMoyenUnitaire: parseFloat(
        (item.totalPrix / item.count).toFixed(2),
      ),
    }));

    return {
      parFormat,
      totalProduits: produits.length,
    };
  }

  /**
   * ✏️ METTRE À JOUR UN PRODUIT
   */
  async updateProduit(
    codeProduit: string,
    dto: UpdateProduitDto,
  ): Promise<{
    message: string;
    produit: any;
  }> {
    // Vérifier que le produit existe
    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit },
    });

    if (!produit) {
      throw new NotFoundException(
        `Produit avec code ${codeProduit} non trouvé`,
      );
    }

    // Construire l'objet de mise à jour (seulement les champs fournis)
    const updateData: any = {};
    if (dto.nomProduit !== undefined) updateData.nomProduit = dto.nomProduit;
    if (dto.categorie !== undefined) updateData.categorie = dto.categorie;
    if (dto.stockMinimum !== undefined)
      updateData.stockMinimum = dto.stockMinimum;
    if (dto.prixUnitaire !== undefined) updateData.prixUnitaire = dto.prixUnitaire;
    if (dto.fournisseur !== undefined) updateData.fournisseur = dto.fournisseur;

    const updated = await this.prisma.produit.update({
      where: { codeProduit },
      data: updateData,
    });

    return {
      message: 'Produit mis à jour avec succès',
      produit: updated,
    };
  }

  /**
   * 🗑️ SUPPRIMER UN PRODUIT
   */
  async deleteProduit(codeProduit: string): Promise<{
    message: string;
  }> {
    const produit = await this.prisma.produit.findUnique({
      where: { codeProduit },
    });

    if (!produit) {
      throw new NotFoundException(
        `Produit avec code ${codeProduit} non trouvé`,
      );
    }

    // Vérifier s'il y a des commandes associées
    const lignesAssociees = await this.prisma.ligneCommande.findMany({
      where: { produitId: codeProduit },
    });

    if (lignesAssociees.length > 0) {
      throw new BadRequestException(
        `Impossible de supprimer. Ce produit est référencé dans ${lignesAssociees.length} commande(s)`,
      );
    }

    await this.prisma.produit.delete({
      where: { codeProduit },
    });

    return {
      message: 'Produit supprimé avec succès',
    };
  }

  /**
   * 📈 ANALYTICS POUR DASHBOARD
   */
  async getProduitsDashboardMetrics(): Promise<{
    totalProduits: number;
    produitsParFormat: Record<string, number>;
    prixMoyenUnitaire: number;
    stockMoyenParProduit: number;
    valeurTotalStock: number;
  }> {
    const produits = await this.prisma.produit.findMany();

    if (produits.length === 0) {
      return {
        totalProduits: 0,
        produitsParFormat: {},
        prixMoyenUnitaire: 0,
        stockMoyenParProduit: 0,
        valeurTotalStock: 0,
      };
    }

    const produitsParFormat = {};
    let totalPrix = 0;
    let totalStock = 0;
    let totalValeur = 0;

    produits.forEach((p) => {
      produitsParFormat[p.format] = (produitsParFormat[p.format] || 0) + 1;
      totalPrix += p.prixUnitaire;
      totalStock += p.stockInitial;
      totalValeur += p.stockInitial * p.prixUnitaire;
    });

    return {
      totalProduits: produits.length,
      produitsParFormat,
      prixMoyenUnitaire: parseFloat((totalPrix / produits.length).toFixed(2)),
      stockMoyenParProduit: Math.round(totalStock / produits.length),
      valeurTotalStock: parseFloat(totalValeur.toFixed(2)),
    };
  }
}
