import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FacturesService } from '../services/factures.service';
import { UpdateFactureDto } from '../dtos/facture.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Factures')
@Controller('factures')
@ApiBearerAuth()
export class FacturesController {
  constructor(private facturesService: FacturesService) {}

  
    //LISTER TOUTES LES FACTURES
   
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lister toutes les factures',
    description: 'Retourne la liste complète des factures émises',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des factures',
  })
  async getAllFactures() {
    return await this.facturesService.getAllFactures();
  }

  
    //RECHERCHER DES FACTURES
   
  @Get('search/query')
  @Public()
  @ApiOperation({
    summary: 'Rechercher des factures',
    description:
      'Recherche les factures par numéro ou nom de client',
  })
  @ApiQuery({
    name: 'q',
    description: 'Numéro de facture ou nom de client',
    example: 'F-2024-089',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats de recherche',
  })
  async searchFactures(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new Error('La requête doit contenir au moins 2 caractères');
    }
    return await this.facturesService.searchFactures(query);
  }

// FILTRER PAR DATE
  @Get('filter/date')
  @Public()
  @ApiOperation({
    summary: 'Filtrer les factures par date',
    description:
      'Retourne les factures émises entre deux dates',
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
    description: 'Factures filtrées par date',
  })
  async getFacturesByDateRange(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
  ) {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      throw new Error('Format de date invalide');
    }

    return await this.facturesService.getFacturesByDateRange(
      dateDebut,
      dateFin,
    );
  }

  /**
   * 📊 STATISTIQUES FACTURES
   */
  @Get('stats/dashboard')
  @Public()
  @ApiOperation({
    summary: 'Statistiques des factures',
    description:
      'Retourne les statistiques: nombre de factures, montants, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des factures',
  })
  async getFacturesStats() {
    return await this.facturesService.getFacturesStats();
  }

  /**
   * 📖 DÉTAILS D'UNE FACTURE
   */
  @Get(':idFacture')
  @Public()
  @ApiOperation({
    summary: 'Récupérer les détails d\'une facture',
    description: 'Retourne tous les détails: vente, client, produits',
  })
  @ApiParam({
    name: 'idFacture',
    description: 'ID de la facture',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la facture',
  })
  @ApiResponse({
    status: 404,
    description: 'Facture non trouvée',
  })
  async getFactureById(@Param('idFacture') idFacture: string) {
    return await this.facturesService.getFactureById(idFacture);
  }

  /**
   * ✏️ METTRE À JOUR UNE FACTURE
   */
  @Put(':idFacture')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Mettre à jour une facture',
    description: 'Modifie le statut ou montant d\'une facture',
  })
  @ApiParam({
    name: 'idFacture',
    description: 'ID de la facture',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Facture mise à jour',
  })
  @ApiResponse({
    status: 404,
    description: 'Facture non trouvée',
  })
  async updateFacture(
    @Param('idFacture') idFacture: string,
    @Body() dto: UpdateFactureDto,
  ) {
    return await this.facturesService.updateFacture(idFacture, dto);
  }
}
