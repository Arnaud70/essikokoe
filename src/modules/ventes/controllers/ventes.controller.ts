import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VentesService } from '../services/ventes.service';
import { CreateVenteDto } from '../dtos/create-vente.dto';
import { UpdateVenteDto } from '../dtos/update-vente.dto';
import { VenteListResponseDto, VenteDetailDto } from '../dtos/vente.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Ventes')
@Controller('ventes')
@ApiBearerAuth()
export class VentesController {
  constructor(private ventesService: VentesService) {}

  
   // CRÉER UNE VENTE
   
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle vente',
    description:
      'Registre une vente avec client et produits, génère la facture et enregistre les mouvements de stock',
  })
  @ApiBody({
    type: CreateVenteDto,
    examples: {
      example1: {
        summary: 'Exemple de vente',
        value: {
          nomClient: 'Restaurant Le Palmier',
          telephone: '+225 01 23 45 67 89',
          adresse: 'Abidjan, Plateau, Rue de la Paix',
          modePaiement: 'Espèces',
          produits: [
            {
              codeProduit: 'PROD-001',
              quantite: 50,
              prixUnitaire: 236,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Vente créée avec succès',
    type: VenteDetailDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur de validation',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  async createVente(@Body() dto: CreateVenteDto) {
    return await this.ventesService.createVente(dto);
  }

  
   // LISTER TOUTES LES VENTES
   
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lister toutes les ventes',
    description: 'Retourne la liste de toutes les ventes avec détails clients',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des ventes',
    type: VenteListResponseDto,
  })
  async getAllVentes() {
    return await this.ventesService.getAllVentes();
  }

  
   // RECHERCHER DES VENTES
   
  @Get('search/query')
  @Public()
  @ApiOperation({
    summary: 'Rechercher des ventes',
    description:
      'Recherche les ventes par numéro de facture ou nom de client',
  })
  @ApiQuery({
    name: 'q',
    description: 'Terme de recherche',
    example: 'Restaurant Le Palmier',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats de recherche',
    type: VenteListResponseDto,
  })
  async searchVentes(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new Error('La requête doit contenir au moins 2 caractères');
    }
    return await this.ventesService.searchVentes(query);
  }

  
   //FILTRER PAR DATE
   
  @Get('filter/date')
  @Public()
  @ApiOperation({
    summary: 'Filtrer les ventes par plage de dates',
    description:
      'Retourne les ventes entre une date de début et une date de fin',
  })
  @ApiQuery({
    name: 'debut',
    description: 'Date de début (ISO format)',
    example: '2024-01-15T00:00:00Z',
    required: true,
  })
  @ApiQuery({
    name: 'fin',
    description: 'Date de fin (ISO format)',
    example: '2024-01-31T23:59:59Z',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Ventes filtrées par date',
    type: VenteListResponseDto,
  })
  async getVentesByDateRange(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
  ) {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      throw new Error('Format de date invalide');
    }

    return await this.ventesService.getVentesByDateRange(dateDebut, dateFin);
  }

  
   // STATISTIQUES DES VENTES
   
  @Get('stats/dashboard')
  @Public()
  @ApiOperation({
    summary: 'Statistiques des ventes',
    description:
      'Retourne les statistiques clés: montant total, nombre de ventes, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des ventes',
    example: {
      montantTotal: 35400,
      nombreVentes: 2,
      montantMoyen: 17700,
      ventesParModePaiement: {
        Espèces: 11800,
        'Mobile Money': 23600,
      },
    },
  })
  async getVentesStats() {
    return await this.ventesService.getVentesStats();
  }

  
   //DÉTAILS D'UNE VENTE
   
  @Get(':idVente')
  @Public()
  @ApiOperation({
    summary: 'Récupérer les détails d\'une vente',
    description: 'Retourne tous les détails: client, produits, facture',
  })
  @ApiParam({
    name: 'idVente',
    description: 'ID de la vente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la vente',
    type: VenteDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vente non trouvée',
  })
  async getVenteDetail(@Param('idVente') idVente: string) {
    return await this.ventesService.getVenteDetail(idVente);
  }

  
   //  MODIFIER UNE VENTE (client, paiement, statut)
   
  @Patch(':idVente')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Modifier une vente (client, paiement, statut)' })
  @ApiParam({ name: 'idVente', description: 'ID de la vente' })
  @ApiResponse({ status: 200, description: 'Vente modifiée', type: VenteDetailDto })
  async updateVente(@Param('idVente') idVente: string, @Body() body: UpdateVenteDto) {
    return await this.ventesService.updateVente(idVente, body);
  }

  
   //SUPPRIMER / ANNULER UNE VENTE
   
  @Delete(':idVente')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer (annuler) une vente' })
  @ApiParam({ name: 'idVente', description: 'ID de la vente' })
  @ApiResponse({ status: 200, description: 'Vente annulée' })
  async deleteVente(@Param('idVente') idVente: string) {
    return await this.ventesService.deleteVente(idVente);
  }
}
