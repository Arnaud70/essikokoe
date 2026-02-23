import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, StockMovementType } from '@prisma/client';
import { CreateVenteDto } from '../dtos/create-vente.dto';
import { VenteListResponseDto, VenteDetailDto } from '../dtos/vente.dto';
import { UpdateVenteDto } from '../dtos/update-vente.dto';

@Injectable()
export class VentesService {
  constructor(private prisma: PrismaService) {}

  
   // HELPER: Générer le numéro de facture
   
  private async generateNumeroFacture(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const count = await this.prisma.facture.count();
    return `F-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  
   //CRÉER UNE VENTE
   
  async createVente(dto: CreateVenteDto): Promise<{
    message: string;
    vente: VenteDetailDto;
  }> {
    // Validation basique côté serveur
    if (!dto.produits || dto.produits.length === 0) {
      throw new BadRequestException('Au moins un produit est obligatoire');
    }

    // Pré-vérifications hors transaction pour réduire la durée de la transaction
    const insufficient: string[] = [];
    let montantTotal = 0;

    for (const prod of dto.produits) {
      if (!prod.codeProduit || prod.quantite <= 0 || prod.prixUnitaire <= 0) {
        throw new BadRequestException('Données de ligne de produit invalides');
      }

      const produitRecord = await this.prisma.produit.findUnique({
        where: { codeProduit: prod.codeProduit },
      });

      if (!produitRecord) {
        throw new NotFoundException(`Produit ${prod.codeProduit} non trouvé`);
      }

      // Calculer stock réel en lisant les mouvements hors transaction
      const mouvements = await this.prisma.stockMovement.findMany({
        where: { codeProduit: prod.codeProduit },
      });

      const delta = mouvements.reduce((acc, m) => {
        if (m.type === 'ENTREE') return acc + m.quantite;
        if (m.type === 'SORTIE') return acc - m.quantite;
        return acc;
      }, 0);

      const stockActuel = (produitRecord.stockInitial || 0) + delta;

      if (prod.quantite > stockActuel) {
        insufficient.push(`${prod.codeProduit} (disponible: ${stockActuel})`);
      }

      montantTotal += prod.quantite * prod.prixUnitaire;
    }

    if (insufficient.length > 0) {
      throw new BadRequestException(
        `Stock insuffisant pour: ${insufficient.join(', ')}`,
      );
    }

    // Générer numéro de facture AVANT la transaction
    const numeroFacture = await this.generateNumeroFacture();

    // Vérifier ou créer le client HORS transaction
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

    // Créer commande HORS transaction
    const commande = await this.prisma.commande.create({
      data: {
        dateCommande: new Date(),
        statut: 'VALIDEE',
        clientId: client.idClient,
      },
    });

    // TRANSACTION MINIMALE: seulement les créations critiques
    try {
      const venteId = await this.prisma.$transaction(
        async (tx) => {
          // Créer vente
          const vente = await tx.vente.create({
            data: {
              dateVente: new Date(),
              montantTotal: montantTotal,
              modePaiement: dto.modePaiement,
              commandeId: commande.idCommande,
            },
          });

          // Créer facture
          await tx.facture.create({
            data: {
              numeroFacture: numeroFacture,
              dateFacture: new Date(),
              montant: montantTotal,
              venteId: vente.idVente,
            },
          });

          // Créer lignes commande
          const lignesData = dto.produits.map((prod) => ({
            commandeId: commande.idCommande,
            produitId: prod.codeProduit,
            quantite: prod.quantite,
            prixUnitaire: prod.prixUnitaire,
            totalLigne: prod.quantite * prod.prixUnitaire,
          }));

          if (lignesData.length > 0) {
            await tx.ligneCommande.createMany({ data: lignesData });
          }

          // Créer mouvements de stock
          const movementsData: Prisma.StockMovementCreateManyInput[] = dto.produits.map((prod) => ({
            codeProduit: prod.codeProduit,
            type: StockMovementType.SORTIE,
            quantite: prod.quantite,
            motif: `Vente - Facture ${numeroFacture}`,
            createdBy: 'system',
          }));

          if (movementsData.length > 0) {
            await tx.stockMovement.createMany({ data: movementsData });
          }

          return vente.idVente;
        },
        {
          timeout: 10000, // Timeout explicite de 10s
        },
      );

      return {
        message: 'Vente créée avec succès',
        vente: await this.getVenteDetail(venteId),
      };
    } catch (err) {
      // En cas d'erreur, nettoyer les ressources créées
      try {
        await this.prisma.commande.delete({
          where: { idCommande: commande.idCommande },
        });
      } catch (cleanupErr) {
        console.error('Erreur cleanup commande:', cleanupErr);
      }

      console.error('Erreur création vente:', err);
      throw new BadRequestException(
        `Échec création vente: ${err?.message || 'erreur inconnue'}`,
      );
    }
  }

  
   // HELPER: Calculer TVA à 18%
   
  private calculateTVA(sousTotal: number): { sousTotal: number; tva: number; total: number } {
    const tva = Math.round(sousTotal * 0.18 * 100) / 100;
    const total = Math.round((sousTotal + tva) * 100) / 100;
    return { sousTotal, tva, total };
  }

  
   // RÉCUPÉRER LES DÉTAILS D'UNE VENTE
   
  async getVenteDetail(idVente: string): Promise<VenteDetailDto> {
    const vente = await this.prisma.vente.findUnique({
      where: { idVente },
      include: {
        commande: {
          include: {
            client: true,
            lignes: {
              include: {
                produit: true,
              },
            },
          },
        },
        facture: true,
      },
    });

    if (!vente) {
      throw new NotFoundException(`Vente ${idVente} non trouvée`);
    }

    // Calculer TVA sur le montant total
    const { sousTotal, tva } = this.calculateTVA(vente.montantTotal);

    return {
      idVente: vente.idVente,
      numeroFacture: vente.facture?.numeroFacture || 'N/A',
      date: vente.dateVente,
      client: vente.commande?.client.nomClient || 'N/A',
      sousTotal: sousTotal,
      tva: tva,
      montant: vente.montantTotal,
      modePaiement: vente.modePaiement,
      statut: 'Payée',
      telephone: vente.commande?.client.telephone || 'N/A',
      adresse: vente.commande?.client.adresse || 'N/A',
      produits: vente.commande?.lignes.map((l) => ({
        codeProduit: l.produitId,
        nomProduit: l.produit.nomProduit,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        totalLigne: l.totalLigne,
      })) || [],
    };
  }

  
   // LISTER TOUTES LES VENTES
   
  async getAllVentes(): Promise<VenteListResponseDto> {
    const ventes = await this.prisma.vente.findMany({
      include: {
        commande: {
          include: {
            client: true,
          },
        },
        facture: true,
      },
      orderBy: { dateVente: 'desc' },
    });

    const ventesDto = ventes.map((v) => {
      const { sousTotal, tva } = this.calculateTVA(v.montantTotal);
      return {
        idVente: v.idVente,
        numeroFacture: v.facture?.numeroFacture || 'N/A',
        date: v.dateVente,
        client: v.commande?.client.nomClient || 'N/A',
        sousTotal,
        tva,
        montant: v.montantTotal,
        modePaiement: v.modePaiement,
        statut: 'Payée',
      };
    });

    return {
      total: ventesDto.length,
      ventes: ventesDto,
    };
  }

  
   // RECHERCHER DES VENTES PAR CLIENT OU FACTURE
   
  async searchVentes(query: string): Promise<VenteListResponseDto> {
    const ventes = await this.prisma.vente.findMany({
      where: {
        OR: [
          { commande: { client: { nomClient: { contains: query, mode: 'insensitive' } } } },
          { facture: { numeroFacture: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        commande: {
          include: {
            client: true,
          },
        },
        facture: true,
      },
      orderBy: { dateVente: 'desc' },
    });

    const ventesDto = ventes.map((v) => {
      const { sousTotal, tva } = this.calculateTVA(v.montantTotal);
      return {
        idVente: v.idVente,
        numeroFacture: v.facture?.numeroFacture || 'N/A',
        date: v.dateVente,
        client: v.commande?.client.nomClient || 'N/A',
        sousTotal,
        tva,
        montant: v.montantTotal,
        modePaiement: v.modePaiement,
        statut: 'Payée',
      };
    });

    return {
      total: ventesDto.length,
      ventes: ventesDto,
    };
  }

  
    //FILTRER PAR PLAGE DE DATES
   
  async getVentesByDateRange(
    dateDebut: Date,
    dateFin: Date,
  ): Promise<VenteListResponseDto> {
    const ventes = await this.prisma.vente.findMany({
      where: {
        dateVente: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
      include: {
        commande: {
          include: {
            client: true,
          },
        },
        facture: true,
      },
      orderBy: { dateVente: 'desc' },
    });

    const ventesDto = ventes.map((v) => {
      const { sousTotal, tva } = this.calculateTVA(v.montantTotal);
      return {
        idVente: v.idVente,
        numeroFacture: v.facture?.numeroFacture || 'N/A',
        date: v.dateVente,
        client: v.commande?.client.nomClient || 'N/A',
        sousTotal,
        tva,
        montant: v.montantTotal,
        modePaiement: v.modePaiement,
        statut: 'Payée',
      };
    });

    return {
      total: ventesDto.length,
      ventes: ventesDto,
    };
  }

  
   // STATISTIQUES DES VENTES
   
  async getVentesStats(): Promise<any> {
    const ventes = await this.prisma.vente.findMany();

    const montantTotal = ventes.reduce((sum, v) => sum + v.montantTotal, 0);
    const nombreVentes = ventes.length;
    const montantMoyen =
      nombreVentes > 0 ? montantTotal / nombreVentes : 0;

    // Ventes par mode de paiement
    const ventesParModePaiement = {};
    ventes.forEach((v) => {
      ventesParModePaiement[v.modePaiement] =
        (ventesParModePaiement[v.modePaiement] || 0) + v.montantTotal;
    });

    return {
      montantTotal,
      nombreVentes,
      montantMoyen: Math.round(montantMoyen),
      ventesParModePaiement,
    };
  }

  
   // Modifier une vente (infos clients, modePaiement, statut de la commande)

  async updateVente(idVente: string, dto: UpdateVenteDto): Promise<VenteDetailDto> {
    const vente = await this.prisma.vente.findUnique({
      where: { idVente },
      include: { commande: { include: { client: true } }, facture: true },
    });

    if (!vente) throw new NotFoundException(`Vente ${idVente} non trouvée`);

    // Ensure commande and client exist before updating
    if (!vente.commande || !vente.commande.client) {
      throw new BadRequestException('Commande ou client associé introuvable pour cette vente');
    }

    // Update client if provided
    if (dto.nomClient || dto.telephone || dto.adresse) {
      await this.prisma.client.update({
        where: { idClient: vente.commande.client.idClient },
        data: {
          nomClient: dto.nomClient ?? undefined,
          telephone: dto.telephone ?? undefined,
          adresse: dto.adresse ?? undefined,
        },
      });
    }

    // Update vente fields
    await this.prisma.vente.update({
      where: { idVente },
      data: {
        modePaiement: dto.modePaiement ?? undefined,
      },
    });

    // Update commande statut if provided
    if (dto.statut) {
      await this.prisma.commande.update({
        where: { idCommande: vente.commande.idCommande },
        data: { statut: dto.statut as any },
      });
    }

    return await this.getVenteDetail(idVente);
  }

  
   // Supprimer (annuler) une vente : restaure le stock et supprime facture/lignes/vente/commande
   
  async deleteVente(idVente: string): Promise<{ message: string }>{
    const vente = await this.prisma.vente.findUnique({
      where: { idVente },
      include: { commande: { include: { lignes: true } }, facture: true },
    });

    if (!vente) throw new NotFoundException(`Vente ${idVente} non trouvée`);

    const numero = vente.facture?.numeroFacture || 'N/A';

    //Préparer opérations pour transaction en lot (batch) — évite interactive tx issues
    const operations: any[] = [];

    const lignes = vente.commande?.lignes || [];
    const movements = lignes.map((l) => ({
      codeProduit: l.produitId,
      type: StockMovementType.ENTREE,
      quantite: l.quantite,
      motif: `Annulation vente ${numero}`,
      createdBy: 'system',
    })) as Prisma.StockMovementCreateManyInput[];

    if (movements.length > 0) operations.push(this.prisma.stockMovement.createMany({ data: movements }));

    // Supprimer la facture d'abord (référence vente)
    if (vente.facture) operations.push(this.prisma.facture.delete({ where: { idFacture: vente.facture.idFacture } }));

    // Supprimer la vente
    operations.push(this.prisma.vente.delete({ where: { idVente } }));

    // Supprimer lignes de commande
    if (lignes.length > 0) {
      const ids = lignes.map((l) => l.idLigne);
      operations.push(this.prisma.ligneCommande.deleteMany({ where: { idLigne: { in: ids } } }));
    }

    // Supprimer la commande (après les lignes)
    if (vente.commande) operations.push(this.prisma.commande.delete({ where: { idCommande: vente.commande.idCommande } }));

    try {
      await this.prisma.$transaction(operations);
    } catch (err) {
      throw new BadRequestException(`Échec suppression vente: ${err?.message || 'erreur inconnue'}`);
    }

    return { message: 'Vente annulée et supprimée avec succès' };
  }
}
