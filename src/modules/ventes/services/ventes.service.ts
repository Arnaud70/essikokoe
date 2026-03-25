import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, StockMovementType, Role } from '@prisma/client';
import { CreateVenteDto } from '../dtos/create-vente.dto';
import { VenteListResponseDto, VenteDetailDto } from '../dtos/vente.dto';
import { UpdateVenteDto } from '../dtos/update-vente.dto';

@Injectable()
export class VentesService {
  constructor(private prisma: PrismaService) { }

  private async generateNumeroFacture(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const count = await this.prisma.facture.count();
    return `F-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async createVente(dto: CreateVenteDto, user: any): Promise<{
    message: string;
    vente: VenteDetailDto;
  }> {
    const magasinId = user.role === 'SUPERADMIN' ? dto.magasinId : user.magasinId;
    if (!magasinId) {
      throw new BadRequestException('ID du magasin requis');
    }

    if (!dto.produits || dto.produits.length === 0) {
      throw new BadRequestException('Au moins un produit est obligatoire');
    }

    const numeroFacture = await this.generateNumeroFacture();

    // Vérifier ou créer le client
    let client = await this.prisma.client.findFirst({
      where: { telephone: dto.telephone },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          nomClient: dto.nomClient,
          telephone: dto.telephone,
          adresse: dto.adresse,
        },
      });
    }

    try {
      const venteId = await this.prisma.$transaction(async (tx) => {
        let totalVente = 0;
        const lignesCreate: Prisma.LigneVenteCreateWithoutVenteInput[] = [];

        for (const prod of dto.produits) {
          const product = await tx.produit.findUnique({
            where: { codeProduit: prod.codeProduit }
          });
          if (!product) throw new NotFoundException(`Produit ${prod.codeProduit} non trouvé`);

          const stock = await tx.stock.findUnique({
            where: { produitId_magasinId: { produitId: prod.codeProduit, magasinId } }
          });

          if (!stock || stock.quantite < prod.quantite) {
            throw new BadRequestException(`Stock insuffisant pour ${product.nomProduit}. Dispo: ${stock?.quantite || 0}`);
          }

          const totalLigne = product.prixUnitaire * prod.quantite; // Use product's price from DB
          totalVente += totalLigne;

          lignesCreate.push({
            produit: { connect: { codeProduit: prod.codeProduit } },
            quantite: prod.quantite,
            prixUnitaire: product.prixUnitaire,
            totalLigne: product.prixUnitaire * prod.quantite,
          });

          // Update Stock
          await tx.stock.update({
            where: { idStock: stock.idStock },
            data: { quantite: { decrement: prod.quantite } }
          });

          // Log Movement
          await tx.stockMovement.create({
            data: {
              codeProduit: prod.codeProduit,
              type: StockMovementType.SORTIE,
              quantite: prod.quantite,
              magasinId: magasinId,
              motif: `Vente - Facture ${numeroFacture}`,
              createdBy: user.email,
            }
          });
        }

        const vente = await tx.vente.create({
          data: {
            dateVente: new Date(),
            montantTotal: totalVente,
            modePaiement: dto.modePaiement,
            magasinId: magasinId,
            clientId: client.idClient,
            vendeurId: user.sub,
            lignes: {
              create: lignesCreate,
            },
            facture: {
              create: {
                numeroFacture,
                dateFacture: new Date(),
                montant: totalVente,
              }
            },
            transaction: {
              create: {
                typeTransaction: 'RECETTE',
                categorie: 'VENTE',
                montant: totalVente,
                description: `Vente facture ${numeroFacture}`,
              }
            }
          }
        });

        return vente.idVente;
      }, {
        maxWait: 5000, 
        timeout: 20000 
      });

      return {
        message: 'Vente créée avec succès',
        vente: await this.getVenteDetail(venteId),
      };
    } catch (err) {
      console.error('Erreur création vente:', err);
      throw new BadRequestException(`Échec création vente: ${err.message}`);
    }
  }

  private calculateTVA(sousTotal: number): { sousTotal: number; tva: number; total: number } {
    const tva = Math.round(sousTotal * 0.18 * 100) / 100;
    const total = Math.round((sousTotal + tva) * 100) / 100;
    return { sousTotal, tva, total };
  }

  async getVenteDetail(idVente: string): Promise<VenteDetailDto> {
    const vente = await this.prisma.vente.findUnique({
      where: { idVente },
      include: {
        client: true,
        lignes: { include: { produit: true } },
        facture: true,
      },
    });

    if (!vente) throw new NotFoundException(`Vente ${idVente} non trouvée`);

    const { sousTotal, tva } = this.calculateTVA(vente.montantTotal);

    return {
      idVente: vente.idVente,
      numeroFacture: vente.facture?.numeroFacture || 'N/A',
      date: vente.dateVente,
      client: vente.client?.nomClient || 'Passant',
      sousTotal,
      tva,
      montant: vente.montantTotal,
      modePaiement: vente.modePaiement,
      statut: 'Payée',
      telephone: vente.client?.telephone || 'N/A',
      adresse: vente.client?.adresse || 'N/A',
      produits: vente.lignes.map((l) => ({
        codeProduit: l.produitId,
        nomProduit: l.produit.nomProduit,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        totalLigne: l.totalLigne,
      })),
    };
  }

  async getAllVentes(user: any): Promise<VenteListResponseDto> {
    const where: any = {};
    if (user.role !== 'SUPERADMIN') {
      where.magasinId = user.magasinId;
    }

    const ventes = await this.prisma.vente.findMany({
      where,
      include: { client: true, facture: true },
      orderBy: { dateVente: 'desc' },
    });

    const ventesDto = ventes.map((v) => {
      const { sousTotal, tva } = this.calculateTVA(v.montantTotal);
      return {
        idVente: v.idVente,
        numeroFacture: v.facture?.numeroFacture || 'N/A',
        date: v.dateVente,
        client: v.client?.nomClient || 'Passant',
        sousTotal,
        tva,
        montant: v.montantTotal,
        modePaiement: v.modePaiement,
        statut: 'Payée',
      };
    });

    return { total: ventesDto.length, ventes: ventesDto };
  }

  async searchVentes(query: string, user: any): Promise<VenteListResponseDto> {
    const where: any = {
      OR: [
        { client: { nomClient: { contains: query, mode: 'insensitive' } } },
        { facture: { numeroFacture: { contains: query, mode: 'insensitive' } } },
      ],
    };

    if (user.role !== 'SUPERADMIN') {
      where.magasinId = user.magasinId;
    }

    const ventes = await this.prisma.vente.findMany({
      where,
      include: { client: true, facture: true },
      orderBy: { dateVente: 'desc' },
    });

    const ventesDto = ventes.map((v) => {
      const { sousTotal, tva } = this.calculateTVA(v.montantTotal);
      return {
        idVente: v.idVente,
        numeroFacture: v.facture?.numeroFacture || 'N/A',
        date: v.dateVente,
        client: v.client?.nomClient || 'Passant',
        sousTotal,
        tva,
        montant: v.montantTotal,
        modePaiement: v.modePaiement,
        statut: 'Payée',
      };
    });

    return { total: ventesDto.length, ventes: ventesDto };
  }

  async getVentesByDateRange(dateDebut: Date, dateFin: Date, user: any): Promise<VenteListResponseDto> {
    const where: any = { dateVente: { gte: dateDebut, lte: dateFin } };
    if (user.role !== 'SUPERADMIN' && user.magasinId) {
      where.magasinId = user.magasinId;
    }
    const ventes = await this.prisma.vente.findMany({
      where,
      include: { client: true, facture: true },
      orderBy: { dateVente: 'desc' },
    });

    const ventesDto = ventes.map((v) => {
      const { sousTotal, tva } = this.calculateTVA(v.montantTotal);
      return {
        idVente: v.idVente,
        numeroFacture: v.facture?.numeroFacture || 'N/A',
        date: v.dateVente,
        client: v.client?.nomClient || 'Passant',
        sousTotal,
        tva,
        montant: v.montantTotal,
        modePaiement: v.modePaiement,
        statut: 'Payée',
      };
    });

    return { total: ventesDto.length, ventes: ventesDto };
  }

  async getVentesStats(user: any): Promise<any> {
    const where: any = {};
    if (user.role !== 'SUPERADMIN') {
      where.magasinId = user.magasinId;
    }

    const ventes = await this.prisma.vente.findMany({ where });
    const montantTotal = ventes.reduce((sum, v) => sum + v.montantTotal, 0);
    const nombreVentes = ventes.length;
    const montantMoyen = nombreVentes > 0 ? montantTotal / nombreVentes : 0;

    const ventesParModePaiement = {};
    ventes.forEach((v) => {
      ventesParModePaiement[v.modePaiement] = (ventesParModePaiement[v.modePaiement] || 0) + v.montantTotal;
    });

    return { montantTotal, nombreVentes, montantMoyen: Math.round(montantMoyen), ventesParModePaiement };
  }

  async updateVente(idVente: string, dto: UpdateVenteDto): Promise<VenteDetailDto> {
    const vente = await this.prisma.vente.findUnique({
      where: { idVente },
      include: { client: true },
    });
    if (!vente) throw new NotFoundException(`Vente ${idVente} non trouvée`);

    if (dto.nomClient || dto.telephone || dto.adresse) {
      if (vente.clientId) {
        await this.prisma.client.update({
          where: { idClient: vente.clientId },
          data: {
            nomClient: dto.nomClient ?? undefined,
            telephone: dto.telephone ?? undefined,
            adresse: dto.adresse ?? undefined,
          },
        });
      }
    }

    await this.prisma.vente.update({
      where: { idVente },
      data: { modePaiement: dto.modePaiement ?? undefined },
    });

    return await this.getVenteDetail(idVente);
  }

  async deleteVente(idVente: string): Promise<{ message: string }> {
    const vente = await this.prisma.vente.findUnique({
      where: { idVente },
      include: { lignes: true, facture: true, transaction: true },
    });
    if (!vente) throw new NotFoundException(`Vente ${idVente} non trouvée`);

    await this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const ligne of vente.lignes) {
        await tx.stock.update({
          where: { produitId_magasinId: { produitId: ligne.produitId, magasinId: vente.magasinId } },
          data: { quantite: { increment: ligne.quantite } }
        });
        await tx.stockMovement.create({
          data: {
            codeProduit: ligne.produitId,
            type: StockMovementType.ENTREE,
            quantite: ligne.quantite,
            magasinId: vente.magasinId,
            motif: `Annulation vente ${vente.facture?.numeroFacture || idVente}`,
            createdBy: 'system',
          }
        });
      }

      await tx.facture.deleteMany({ where: { venteId: idVente } });
      await tx.transaction.deleteMany({ where: { venteId: idVente } });
      await tx.ligneVente.deleteMany({ where: { venteId: idVente } });
      await tx.vente.delete({ where: { idVente } });
    }, {
      maxWait: 5000,
      timeout: 20000
    });

    return { message: 'Vente annulée et supprimée avec succès' };
  }
}
