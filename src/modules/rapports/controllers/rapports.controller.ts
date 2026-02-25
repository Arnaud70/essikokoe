import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RapportsService } from '../services/rapports.service';

@ApiTags('rapports')

@Controller('rapports')
@ApiBearerAuth()
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'UTILISATEUR')
  @Get('produits')
  async getProduitsRapport() {
    return this.rapportsService.getProduitsRapport();
  }
}
