import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RapportService } from '../services/rapport.service';
import { RapportGlobalDto } from '../dtos/rapport-global.dto';

@ApiTags('Rapports')
@Controller('rapports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RapportController {
  constructor(private rapportService: RapportService) {}

  /**
   * 📊 GÉNÉRER LE RAPPORT GLOBAL
   * Agrège les données de tous les modules (Ventes, Produits, Clients, Comptabilité)
   */
  @Get('global')
  @ApiOperation({
    summary: 'Générer le rapport global',
    description: 'Agrège les données de tous les modules pour générer un rapport complet incluant ventes, produits, clients et comptabilité',
  })
  @ApiResponse({
    status: 200,
    description: 'Rapport global généré avec succès',
    type: RapportGlobalDto,
  })
  async getRapportGlobal(): Promise<RapportGlobalDto> {
    return this.rapportService.generateRapportGlobal();
  }
}
