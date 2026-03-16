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
  constructor(private prisma: PrismaService) { }

  private async getRealStock(codeProduit: string, magasinId?: string): Promise<number> {
    if (!magasinId) return 0;
    const stock = await (this.prisma as any).stock.findUnique({
      where: {
        produitId_magasinId: {
          produitId: codeProduit,
          magasinId: magasinId,
        },
      },
    });
    return stock?.quantite || 0;
  }

  private getStatut(stock: number, stockMinimum: number): string {
    return stock <= stockMinimum ? 'Stock Faible' : 'En stock';
  }

  private async mapProduitToDto(produit: any, user?: any): Promise<any> {
    const isSuperAdmin = user?.role?.toUpperCase() === 'SUPERADMIN';
    const magasinId = user?.magasinId;

    let stock = 0;
    if (isSuperAdmin && !magasinId) {
      // Pour superadmin sans filtre magasin, on somme tout le stock
      const allStocks = await (this.prisma as any).stock.findMany({
        where: { produitId: produit.codeProduit }
      });
      stock = allStocks.reduce((acc, s) => acc + s.quantite, 0);
    } else {
      stock = await this.getRealStock(produit.codeProduit, magasinId);
    }
    
    const statut = this.getStatut(stock, (produit as any).stockMinimum || 0);

    return {
      codeProduit: produit.codeProduit,
      nomProduit: produit.nomProduit,
      format: produit.format,
      type: produit.type,
      stock: stock,
      statut: statut,
      prixUnitaire: produit.prixUnitaire,
      fournisseur: produit.fournisseur,
      categorie: produit.categorie,
    };
  }

  async createProduit(dto: CreateProduitDto, user: any): Promise<{
    message: string;
    produit: any;
  }> {
    if (!user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }

    // Règle 1: Unicité (Nom + Catégorie)
    const existing = await (this.prisma as any).produit.findFirst({
      where: {
        nomProduit: dto.nomProduit,
        format: dto.format,
      },
    });

    if (existing) {
      throw new BadRequestException(`Un produit avec le nom "${dto.nomProduit}" existe déjà avec le format "${dto.format}"`);
    }

    // Règle 2: Fournisseur obligatoire pour ACHAT
    if (dto.type === 'ACHAT' && !dto.fournisseur) {
      throw new BadRequestException('Le fournisseur est obligatoire pour les produits de type ACHAT');
    }

    // Les produits sont maintenant globaux
    const count = await (this.prisma as any).produit.count();
    const codeProduit = `PROD-${String(count + 1).padStart(3, '0')}`;

    // Déterminer le magasin cible pour le stock initial
    let targetMagasinId = dto.magasinId || user.magasinId;

    if (!targetMagasinId) {
      // Si aucun magasin n'est lié, on cherche le Dépôt Central
      const central = await (this.prisma as any).magasin.findFirst({
        where: { nom: 'Dépôt Central' },
      });
      targetMagasinId = central?.idMagasin;
    }

    const produit = await (this.prisma as any).produit.create({
      data: {
        codeProduit: codeProduit,
        nomProduit: dto.nomProduit,
        format: dto.format,
        type: dto.type as any,
        categorie: dto.categorie,
        prixUnitaire: dto.prixUnitaire,
        fournisseur: dto.fournisseur || null,
        // Relation stocks via l'upsert ou create dans la table Stock
        stocks: targetMagasinId ? {
          create: {
            magasinId: targetMagasinId,
            quantite: dto.stockInitial || 0,
          }
        } : undefined,
      },
    });

    return {
      message: 'Produit créé au catalogue avec succès',
      produit,
    };
  }

  async getProduitByCode(codeProduit: string): Promise<any> {
    const produit = await (this.prisma as any).produit.findUnique({
      where: { codeProduit },
      include: { stocks: true },
    });

    if (!produit) {
      throw new NotFoundException(`Produit avec code ${codeProduit} non trouvé`);
    }

    return produit;
  }

  async getAllProduits(user: any): Promise<ProduitListResponseDto> {
    const where: any = {};
    const isSuperAdmin = user?.role?.toUpperCase() === 'SUPERADMIN';

    if (!isSuperAdmin && user?.magasinId) {
      where.stocks = { some: { magasinId: user.magasinId } };
    }

    const produits = await (this.prisma as any).produit.findMany({
      where,
      orderBy: { codeProduit: 'asc' },
    });

    // Si l'utilisateur est lié à un magasin, on montre son stock local
    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p, user)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  async searchProduits(query: string, user?: any): Promise<ProduitListResponseDto> {
    const where: any = {
      OR: [
        { codeProduit: { contains: query, mode: 'insensitive' } },
        { nomProduit: { contains: query, mode: 'insensitive' } },
        { fournisseur: { contains: query, mode: 'insensitive' } },
      ],
    };

    const isSuperAdmin = user?.role?.toUpperCase() === 'SUPERADMIN';
    if (user && !isSuperAdmin && user.magasinId) {
      where.stocks = { some: { magasinId: user.magasinId } };
    }

    const produits = await (this.prisma as any).produit.findMany({
      where,
    });

    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p, user)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  async getProduitsByFormat(format: string): Promise<ProduitListResponseDto> {
    const formatUppper = format.toUpperCase() as any;
    const produits = await (this.prisma as any).produit.findMany({
      where: { format: formatUppper },
      orderBy: { nomProduit: 'asc' },
    });

    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  async getStatsByFormat(): Promise<ProduitsByFormatResponseDto> {
    const produits = await (this.prisma as any).produit.findMany();
    const mapFormat = new Map<string, any>();

    produits.forEach((p: any) => {
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
      prixMoyenUnitaire: parseFloat((item.totalPrix / item.count).toFixed(2)),
    }));

    return {
      parFormat,
      totalProduits: produits.length,
    };
  }

  async updateProduit(codeProduit: string, dto: UpdateProduitDto | any): Promise<any> {
    const produit = await (this.prisma as any).produit.findUnique({ where: { codeProduit } });
    if (!produit) throw new NotFoundException('Produit non trouvé');

    const dataToUpdate: any = {};
    if (dto.nomProduit !== undefined) dataToUpdate.nomProduit = dto.nomProduit;
    if (dto.format !== undefined) dataToUpdate.format = dto.format;
    if (dto.categorie !== undefined) dataToUpdate.categorie = dto.categorie;
    if (dto.type !== undefined) dataToUpdate.type = dto.type;
    if (dto.prixUnitaire !== undefined) dataToUpdate.prixUnitaire = dto.prixUnitaire;
    // Fournisseur peut être null ou undefined, on respecte le standard Prisma
    if (dto.fournisseur !== undefined) dataToUpdate.fournisseur = dto.fournisseur;

    const updated = await (this.prisma as any).produit.update({
      where: { codeProduit },
      data: dataToUpdate,
    });

    return { message: 'Produit mis à jour avec succès', produit: updated };
  }

  async deleteProduit(codeProduit: string): Promise<{ message: string }> {
    await (this.prisma as any).produit.delete({ where: { codeProduit } });
    return { message: 'Produit supprimé avec succès' };
  }

  async getProduitsDashboardMetrics(user: any): Promise<any> {
    const produits = await (this.prisma as any).produit.findMany({
      include: { 
        stocks: user.role === 'SUPERADMIN' ? true : { where: { magasinId: user.magasinId } } 
      }
    });

    if (produits.length === 0) {
      return { totalProduits: 0, produitsParFormat: {}, prixMoyenUnitaire: 0, stockMoyenParProduit: 0, valeurTotalStock: 0 };
    }

    const produitsParFormat = {};
    let totalPrix = 0;
    let totalStock = 0;
    let totalValeur = 0;

    produits.forEach((p: any) => {
      produitsParFormat[p.format] = (produitsParFormat[p.format] || 0) + 1;
      totalPrix += p.prixUnitaire;
      const currentStock = p.stocks.reduce((acc, s) => acc + s.quantite, 0);
      totalStock += currentStock;
      totalValeur += currentStock * p.prixUnitaire;
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
