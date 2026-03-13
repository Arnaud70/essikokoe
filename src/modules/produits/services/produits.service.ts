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
    return stock < stockMinimum ? 'Stock Faible' : 'En stock';
  }

  private async mapProduitToDto(produit: any, magasinId?: string): Promise<any> {
    const stock = await this.getRealStock(produit.codeProduit, magasinId);
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
    };
  }

  async createProduit(dto: CreateProduitDto, user: any): Promise<{
    message: string;
    produit: any;
  }> {
    // Les produits sont maintenant globaux
    const count = await this.prisma.produit.count();
    const codeProduit = `PROD-${String(count + 1).padStart(3, '0')}`;

    // Le stock initial est ajouté à un magasin spécifique (par défaut le dépôt central si fourni)
    const magasinId = dto.magasinId || (user.role !== 'SUPERADMIN' ? user.magasinId : undefined);

    const produit = await this.prisma.produit.create({
      data: {
        codeProduit: codeProduit,
        nomProduit: dto.nomProduit,
        format: dto.format as any,
        type: dto.type as any,
        categorie: dto.categorie,
        prixUnitaire: dto.prixUnitaire,
        fournisseur: dto.fournisseur,
        // Relation stocks via l'upsert ou create dans la table Stock
        stocks: magasinId ? {
          create: {
            magasinId: magasinId,
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
    const produits = await (this.prisma as any).produit.findMany({
      orderBy: { codeProduit: 'asc' },
    });

    // Si l'utilisateur est lié à un magasin, on montre son stock local
    const produitsWithStock = await Promise.all(
      produits.map((p) => this.mapProduitToDto(p, user?.magasinId)),
    );

    return {
      total: produitsWithStock.length,
      produits: produitsWithStock as any,
    };
  }

  async searchProduits(query: string): Promise<ProduitListResponseDto> {
    const produits = await (this.prisma as any).produit.findMany({
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

  async updateProduit(codeProduit: string, dto: UpdateProduitDto): Promise<any> {
    const produit = await (this.prisma as any).produit.findUnique({ where: { codeProduit } });
    if (!produit) throw new NotFoundException('Produit non trouvé');

    const updated = await (this.prisma as any).produit.update({
      where: { codeProduit },
      data: dto,
    });

    return { message: 'Produit mis à jour avec succès', produit: updated };
  }

  async deleteProduit(codeProduit: string): Promise<{ message: string }> {
    await (this.prisma as any).produit.delete({ where: { codeProduit } });
    return { message: 'Produit supprimé avec succès' };
  }

  async getProduitsDashboardMetrics(user: any): Promise<any> {
    const produits = await (this.prisma as any).produit.findMany({
      include: { stocks: true }
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
