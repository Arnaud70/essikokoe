import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateFactureDto } from '../dtos/facture.dto';

@Injectable()
export class FacturesService {
  constructor(private prisma: PrismaService) {}

  
   //RÉCUPÉRER UNE FACTURE PAR ID
   
  async getFactureById(idFacture: string): Promise<any> {
    const facture = await this.prisma.facture.findUnique({
      where: { idFacture },
      include: {
        vente: {
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
          },
        },
      },
    });

    if (!facture) {
      throw new NotFoundException(`Facture ${idFacture} non trouvée`);
    }

    return facture;
  }

  
    //LISTER TOUTES LES FACTURES
   
  async getAllFactures(): Promise<{
    total: number;
    factures: any[];
  }> {
    const factures = await this.prisma.facture.findMany({
      include: {
        vente: {
          include: {
            commande: {
              include: {
                client: true,
              },
            },
          },
        },
      },
      orderBy: { dateFacture: 'desc' },
    });

    const facturesDTO = factures.map((f) => ({
      idFacture: f.idFacture,
      numeroFacture: f.numeroFacture,
      dateFacture: f.dateFacture,
      montant: f.montant,
      client: f.vente?.commande?.client?.nomClient || 'N/A',
      statut: 'Payée',
    }));

    return {
      total: facturesDTO.length,
      factures: facturesDTO,
    };
  }

  
    //RECHERCHER DES FACTURES
   
  async searchFactures(query: string): Promise<{
    total: number;
    factures: any[];
  }> {
    const factures = await this.prisma.facture.findMany({
      where: {
        OR: [
          { numeroFacture: { contains: query, mode: 'insensitive' } },
          {
            vente: {
              commande: {
                client: { nomClient: { contains: query, mode: 'insensitive' } },
              },
            },
          },
        ],
      },
      include: {
        vente: {
          include: {
            commande: {
              include: {
                client: true,
              },
            },
          },
        },
      },
      orderBy: { dateFacture: 'desc' },
    });

    const facturesDTO = factures.map((f) => ({
      idFacture: f.idFacture,
      numeroFacture: f.numeroFacture,
      dateFacture: f.dateFacture,
      montant: f.montant,
      client: f.vente?.commande?.client?.nomClient || 'N/A',
      statut: 'Payée',
    }));

    return {
      total: facturesDTO.length,
      factures: facturesDTO,
    };
  }

  
   //FILTRER PAR DATE
   
  async getFacturesByDateRange(
    dateDebut: Date,
    dateFin: Date,
  ): Promise<{
    total: number;
    factures: any[];
  }> {
    const factures = await this.prisma.facture.findMany({
      where: {
        dateFacture: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
      include: {
        vente: {
          include: {
            commande: {
              include: {
                client: true,
              },
            },
          },
        },
      },
      orderBy: { dateFacture: 'desc' },
    });

    const facturesDTO = factures.map((f) => ({
      idFacture: f.idFacture,
      numeroFacture: f.numeroFacture,
      dateFacture: f.dateFacture,
      montant: f.montant,
      client: f.vente?.commande?.client?.nomClient || 'N/A',
      statut: 'Payée',
    }));

    return {
      total: facturesDTO.length,
      factures: facturesDTO,
    };
  }

  
   // METTRE À JOUR UNE FACTURE
  async updateFacture(
    idFacture: string,
    dto: UpdateFactureDto,
  ): Promise<{
    message: string;
    facture: any;
  }> {
    const facture = await this.prisma.facture.update({
      where: { idFacture },
      data: {
        ...(dto.montant && { montant: dto.montant }),
        ...(dto.statut && { statut: dto.statut }),
      },
    });

    return {
      message: 'Facture mise à jour avec succès',
      facture,
    };
  }

  
    //STATISTIQUES FACTURES
   
  async getFacturesStats(): Promise<any> {
    const factures = await this.prisma.facture.findMany();

    const totalFactures = factures.length;
    const montantTotal = factures.reduce((sum, f) => sum + f.montant, 0);
    const montantMoyen =
      totalFactures > 0 ? montantTotal / totalFactures : 0;

    return {
      totalFactures,
      montantTotal: Math.round(montantTotal),
      montantMoyen: Math.round(montantMoyen),
    };
  }
}
