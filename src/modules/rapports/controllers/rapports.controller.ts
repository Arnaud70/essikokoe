import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RapportsService } from '../services/rapports.service';
import { SalesReportDto } from '../dtos/sales-metrics.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Rapports')
@Controller('rapports')
@ApiBearerAuth()
export class RapportsController {
  constructor(private rapportsService: RapportsService) {}

  /**
   * Rapport de ventes - Métriques mensuelles et comparaison
   */
  @Get('ventes')
  @Roles('ADMIN')
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
