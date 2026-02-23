import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from '../dtos/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🆕 CRÉER UN CLIENT
   */
  async createClient(dto: CreateClientDto): Promise<{
    message: string;
    client: any;
  }> {
    const client = await this.prisma.client.create({
      data: {
        nomClient: dto.nomClient,
        telephone: dto.telephone,
        adresse: dto.adresse,
      },
    });

    return {
      message: 'Client créé avec succès',
      client,
    };
  }

  /**
   * 📖 RÉCUPÉRER UN CLIENT PAR ID
   */
  async getClientById(idClient: string): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { idClient },
      include: {
        commandes: {
          include: {
            vente: {
              include: {
                facture: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client ${idClient} non trouvé`);
    }

    return client;
  }

  /**
   * 📋 LISTER TOUS LES CLIENTS
   */
  async getAllClients(): Promise<{
    total: number;
    clients: any[];
  }> {
    const clients = await this.prisma.client.findMany({
      include: {
        commandes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const clientsDTO = clients.map((c) => ({
      idClient: c.idClient,
      nomClient: c.nomClient,
      telephone: c.telephone,
      adresse: c.adresse,
      nombreCommandes: c.commandes.length,
      dateCreation: c.createdAt,
    }));

    return {
      total: clientsDTO.length,
      clients: clientsDTO,
    };
  }

  /**
   * 🔍 RECHERCHER DES CLIENTS
   */
  async searchClients(query: string): Promise<{
    total: number;
    clients: any[];
  }> {
    const clients = await this.prisma.client.findMany({
      where: {
        OR: [
          { nomClient: { contains: query, mode: 'insensitive' } },
          { telephone: { contains: query, mode: 'insensitive' } },
          { adresse: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        commandes: true,
      },
    });

    const clientsDTO = clients.map((c) => ({
      idClient: c.idClient,
      nomClient: c.nomClient,
      telephone: c.telephone,
      adresse: c.adresse,
      nombreCommandes: c.commandes.length,
      dateCreation: c.createdAt,
    }));

    return {
      total: clientsDTO.length,
      clients: clientsDTO,
    };
  }

  /**
   * ✏️ METTRE À JOUR UN CLIENT
   */
  async updateClient(
    idClient: string,
    dto: UpdateClientDto,
  ): Promise<{
    message: string;
    client: any;
  }> {
    const client = await this.prisma.client.update({
      where: { idClient },
      data: {
        ...(dto.nomClient && { nomClient: dto.nomClient }),
        ...(dto.telephone && { telephone: dto.telephone }),
        ...(dto.adresse && { adresse: dto.adresse }),
      },
    });

    return {
      message: 'Client mis à jour avec succès',
      client,
    };
  }

  
   // SUPPRIMER UN CLIENT
   
  async deleteClient(idClient: string): Promise<{
    message: string;
  }> {
    // Vérifier si le client a des commandes
    const commandes = await this.prisma.commande.findMany({
      where: { clientId: idClient },
    });

    if (commandes.length > 0) {
      throw new ConflictException(
        'Impossible de supprimer un client ayant des commandes',
      );
    }

    await this.prisma.client.delete({
      where: { idClient },
    });

    return {
      message: 'Client supprimé avec succès',
    };
  }

  
   // STATISTIQUES CLIENTS
   
  async getClientsStats(): Promise<any> {
    const clients = await this.prisma.client.findMany({
      include: {
        commandes: {
          include: {
            vente: true,
          },
        },
      },
    });

    const totalClients = clients.length;
    let totalDepense = 0;
    let clientTopSpender: { nom: string; totalDepense: number } | null = null;
    let maxDepense = 0;

    clients.forEach((c) => {
      let depenseClient = 0;
      c.commandes.forEach((cmd) => {
        if (cmd.vente) {
          depenseClient += cmd.vente.montantTotal;
        }
      });
      totalDepense += depenseClient;

      if (depenseClient > maxDepense) {
        maxDepense = depenseClient;
        clientTopSpender = {
          nom: c.nomClient,
          totalDepense: depenseClient,
        };
      }
    });

    const montantMoyen =
      totalClients > 0 ? totalDepense / totalClients : 0;

    return {
      totalClients,
      totalDepense: Math.round(totalDepense),
      montantMoyenParClient: Math.round(montantMoyen),
      clientTopSpender,
    };
  }
}
