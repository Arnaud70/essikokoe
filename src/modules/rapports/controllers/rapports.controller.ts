import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RapportsService } from '../services/rapports.service';
import { SalesReportDto } from '../dtos/sales-metrics.dto';

@ApiTags('rapports')
@Controller('rapports')
@ApiBearerAuth()
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'UTILISATEUR')
  @Get('produits')
  @ApiOperation({ summary: 'Rapport produits - Classement par ventes' })
  async getProduitsRapport() {
    return this.rapportsService.getProduitsRapport();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @Get('ventes')
  @ApiOperation({
    summary: 'Rapport de ventes',
    description:
      'Génère un rapport complet des ventes avec métriques (CA, commandes, panier moyen, taux de croissance) et comparaison des 3 derniers mois',
  })
  @ApiResponse({
    status: 200,
    description: 'Rapport de ventes généré',
    type: SalesReportDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Admin requis',
  })
  async getSalesReport() {
    return await this.rapportsService.generateSalesReport();
  }
}
