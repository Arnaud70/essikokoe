import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientsService } from '../services/clients.service';
import { CreateClientDto, UpdateClientDto } from '../dtos/client.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Clients')
@Controller('clients')
@ApiBearerAuth()
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  
   //  CRÉER UN CLIENT
   
  @Post()
  @Post()
  @Roles('SUPERADMIN', 'GERANT', 'VENDEUR', 'RESPONSABLE_ACHAT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau client',
    description: 'Enregistre les informations complètes du client',
  })
  @ApiResponse({
    status: 201,
    description: 'Client créé avec succès',
  })
  async createClient(@Body() dto: CreateClientDto) {
    return await this.clientsService.createClient(dto);
  }

  
    // LISTER TOUS LES CLIENTS
   
  @Get()
  @Roles('SUPERADMIN', 'GERANT', 'VENDEUR', 'RESPONSABLE_ACHAT')
  @ApiOperation({
    summary: 'Lister tous les clients',
    description: 'Retourne la liste de tous les clients enregistrés',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des clients',
  })
  async getAllClients() {
    return await this.clientsService.getAllClients();
  }

  
   // RECHERCHER DES CLIENTS
   
  @Get('search/query')
  @Public()
  @ApiOperation({
    summary: 'Rechercher des clients',
    description:
      'Recherche les clients par nom, téléphone ou adresse',
  })
  @ApiQuery({
    name: 'q',
    description: 'Terme de recherche',
    example: 'Restaurant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats de recherche',
  })
  async searchClients(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new Error('La requête doit contenir au moins 2 caractères');
    }
    return await this.clientsService.searchClients(query);
  }

  
   //  STATISTIQUES CLIENTS
   
  @Get('stats/dashboard')
  @Roles('SUPERADMIN', 'GERANT', 'VENDEUR', 'RESPONSABLE_ACHAT')
  @ApiOperation({
    summary: 'Statistiques des clients',
    description:
      'Retourne les statistiques clés: nombre de clients, dépenses, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des clients',
  })
  async getClientsStats(@Request() req: any) {
    return await this.clientsService.getClientsStats(req.user);
  }

  
   //DÉTAILS D'UN CLIENT
   
  @Get(':idClient')
  @Public()
  @ApiOperation({
    summary: 'Récupérer les détails d\'un client',
    description: 'Retourne toutes les informations et commandes du client',
  })
  @ApiParam({
    name: 'idClient',
    description: 'ID du client',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails du client',
  })
  @ApiResponse({
    status: 404,
    description: 'Client non trouvé',
  })
  async getClientById(@Param('idClient') idClient: string) {
    return await this.clientsService.getClientById(idClient);
  }

  
   //METTRE À JOUR UN CLIENT
   
  @Put(':idClient')
  @Put(':idClient')
  @Roles('SUPERADMIN', 'GERANT', 'VENDEUR')
  @ApiOperation({
    summary: 'Mettre à jour un client',
    description: 'Modifie les informations du client',
  })
  @ApiParam({
    name: 'idClient',
    description: 'ID du client',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Client mis à jour',
  })
  @ApiResponse({
    status: 404,
    description: 'Client non trouvé',
  })
  async updateClient(
    @Param('idClient') idClient: string,
    @Body() dto: UpdateClientDto,
  ) {
    return await this.clientsService.updateClient(idClient, dto);
  }

  
   // SUPPRIMER UN CLIENT
  @Delete(':idClient')
  @Delete(':idClient')
  @Roles('SUPERADMIN', 'GERANT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un client',
    description: 'Supprime un client (seulement si pas de commandes)',
  })
  @ApiParam({
    name: 'idClient',
    description: 'ID du client',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Client supprimé',
  })
  @ApiResponse({
    status: 404,
    description: 'Client non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Client a des commandes, suppression impossible',
  })
  async deleteClient(@Param('idClient') idClient: string) {
    return await this.clientsService.deleteClient(idClient);
  }
}
