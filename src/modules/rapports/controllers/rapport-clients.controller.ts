import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RapportService } from '../services/rapport.service';
import { RapportClientsDto } from '../dtos/rapport-clients.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Rapports - Clients')
@Controller('rapports/clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RapportClientsController {
  constructor(private readonly rapportService: RapportService) {}

  @Get()
  @ApiOperation({ summary: "Rapport clients", description: "Nombre de clients, nouveaux clients, clients actifs, etc." })
  @ApiResponse({ status: 200, description: 'Rapport clients', type: RapportClientsDto })
  async getClientsReport(): Promise<RapportClientsDto> {
    return this.rapportService.getRapportClients();
  }
}
