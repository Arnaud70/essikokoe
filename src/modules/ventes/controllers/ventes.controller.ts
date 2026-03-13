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
  Request,
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
  constructor(private ventesService: VentesService) { }

  @Post()
  @Roles('SUPERADMIN', 'GERANT', 'VENDEUR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle vente',
    description: 'Registre une vente avec client et produits, génère la facture et enregistre les mouvements de stock',
  })
  @ApiResponse({ status: 201, description: 'Vente créée avec succès', type: VenteDetailDto })
  async createVente(@Body() dto: CreateVenteDto, @Request() req: any) {
    return await this.ventesService.createVente(dto, req.user);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister toutes les ventes' })
  async getAllVentes(@Request() req: any) {
    return await this.ventesService.getAllVentes(req.user);
  }

  @Get('search/query')
  @Public()
  @ApiOperation({ summary: 'Rechercher des ventes' })
  async searchVentes(@Query('q') query: string, @Request() req: any) {
    if (!query || query.trim().length < 2) {
      throw new Error('La requête doit contenir au moins 2 caractères');
    }
    return await this.ventesService.searchVentes(query, req.user);
  }

  @Get('filter/date')
  @Public()
  @ApiOperation({ summary: 'Filtrer les ventes par plage de dates' })
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

  @Get('stats/dashboard')
  @Public()
  @ApiOperation({ summary: 'Statistiques des ventes' })
  async getVentesStats() {
    return await this.ventesService.getVentesStats();
  }

  @Get(':idVente')
  @Public()
  @ApiOperation({ summary: 'Récupérer les détails d\'une vente' })
  async getVenteDetail(@Param('idVente') idVente: string) {
    return await this.ventesService.getVenteDetail(idVente);
  }

  @Patch(':idVente')
  @Roles('SUPERADMIN', 'GERANT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Modifier une vente (client, paiement, statut)' })
  async updateVente(@Param('idVente') idVente: string, @Body() body: UpdateVenteDto) {
    return await this.ventesService.updateVente(idVente, body);
  }

  @Delete(':idVente')
  @Roles('SUPERADMIN', 'GERANT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer (annuler) une vente' })
  async deleteVente(@Param('idVente') idVente: string) {
    return await this.ventesService.deleteVente(idVente);
  }
}
