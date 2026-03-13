import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RapportsService } from '../services/rapports.service';
import { SalesReportDto } from '../dtos/sales-metrics.dto';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('rapports')
@Controller('rapports')
@ApiBearerAuth()
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) { }

  @UseGuards(JwtAuthGuard)
  @Roles('SUPERADMIN', 'GERANT')
  @Get('produits')
  @ApiOperation({ summary: 'Rapport produits - Classement par ventes' })
  async getProduitsRapport(
    @Request() req: any,
    @Query('debut') debut?: string,
    @Query('fin') fin?: string,
  ) {
    const debutDate = debut ? new Date(debut) : undefined;
    const finDate = fin ? new Date(fin) : undefined;
    return this.rapportsService.getProduitsRapport(req.user, debutDate, finDate);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('SUPERADMIN', 'GERANT')
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
  async getSalesReport(@Request() req: any) {
    return await this.rapportsService.generateSalesReport(req.user);
  }
}
