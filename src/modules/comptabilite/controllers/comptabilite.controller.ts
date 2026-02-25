import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ComptabiliteService } from '../services/comptabilite.service';
import { Public } from '../../../auth/decorators/public.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { CreateRapportDto } from '../dtos/create-rapport.dto';
import { CreateBilanDto } from '../dtos/create-bilan.dto';
import { TransactionResponseDto } from '../dtos/transaction.dto';
import { RapportResponseDto } from '../dtos/rapport.dto';
import { BilanResponseDto } from '../dtos/bilan.dto';
import { BilanDetailDto } from '../dtos/bilan-detail.dto';
import { AuditLogDto } from '../dtos/audit-log.dto';
import { AuditStatusDto, AuditEquilibrationDto, AuditTrendDto } from '../dtos/audit-control.dto';

@ApiTags('Comptabilité')
@Controller('comptabilite')
@ApiBearerAuth()
export class ComptabiliteController {
  constructor(private readonly comptabiliteService: ComptabiliteService) {}

  // ===== TRANSACTIONS =====
  
  @Post('transactions')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une transaction (recette/dépense)' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return this.comptabiliteService.createTransaction(dto);
  }

  @Get('transactions')
  @Public()
  @ApiOperation({ summary: 'Lister les transactions' })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getTransactions(@Query('type') type?: string) {
    return this.comptabiliteService.getTransactions(type);
  }

  @Get('transactions/:id')
  @Public()
  @ApiOperation({ summary: 'Récupérer une transaction par ID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async getTransactionById(@Param('id') id: string) {
    return this.comptabiliteService.getTransactionById(id);
  }

  @Get('distribution')
  @Public()
  @ApiOperation({ summary: 'Répartition des recettes et dépenses par catégorie' })
  @ApiResponse({ status: 200, description: 'Distribution des transactions' })
  async getDistribution() {
    return this.comptabiliteService.getDistributionByCategory();
  }

  // ===== RAPPORTS =====
  
  @Get('rapports')
  @Public()
  @ApiOperation({ summary: 'Lister les rapports comptables' })
  @ApiResponse({ status: 200, description: 'Liste des rapports' })
  async getRapports() {
    return this.comptabiliteService.getRapports();
  }

  @Post('rapports')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un rapport (journalier/mensuel)' })
  @ApiBody({ type: CreateRapportDto })
  @ApiResponse({ status: 201, type: RapportResponseDto })
  async createRapport(@Body() dto: CreateRapportDto) {
    return this.comptabiliteService.createRapport(dto);
  }

  // ===== BILAN =====
  
  @Get('bilan/summary')
  @Public()
  @ApiOperation({ summary: 'Obtenir le bilan financier détaillé' })
  @ApiResponse({ status: 200, type: BilanDetailDto })
  async getBilanSummary() {
    return this.comptabiliteService.getBilanSummary();
  }

  @Get('bilan')
  @Public()
  @ApiOperation({ summary: 'Lister les bilans' })
  @ApiResponse({ status: 200, description: 'Liste des bilans' })
  async getBilans() {
    return this.comptabiliteService.getBilans();
  }

  @Post('bilan')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un bilan comptable' })
  @ApiBody({ type: CreateBilanDto })
  @ApiResponse({ status: 201, type: BilanResponseDto })
  async createBilan(@Body() dto: CreateBilanDto) {
    return this.comptabiliteService.createBilan(dto);
  }

  // ===== AUDIT =====
  
  @Get('audit/status')
  @Public()
  @ApiOperation({ summary: 'Statut d\'audit - transactions vérifiées et écarts' })
  @ApiResponse({ status: 200, type: AuditStatusDto })
  async getAuditStatus() {
    return this.comptabiliteService.getAuditStatus();
  }

  @Get('audit/equilibration')
  @Public()
  @ApiOperation({ summary: 'Vérifier l\'équilibrage du bilan' })
  @ApiResponse({ status: 200, type: AuditEquilibrationDto })
  async verifyEquilibration() {
    return this.comptabiliteService.verifyEquilibration();
  }

  @Get('audit/trends')
  @Public()
  @ApiOperation({ summary: 'Analyser les tendances financières' })
  @ApiResponse({ status: 200, type: AuditTrendDto })
  async analyzeTrends() {
    return this.comptabiliteService.analyzeTrends();
  }

  @Get('audit/report')
  @Public()
  @ApiOperation({ summary: 'Générer un rapport d\'audit complet' })
  @ApiResponse({ status: 200, description: 'Rapport d\'audit avec recommandations' })
  async generateAuditReport() {
    return this.comptabiliteService.generateAuditReport();
  }

  @Get('audit/logs')
  @Public()
  @ApiOperation({ summary: 'Voir les logs d\'audit' })
  @ApiResponse({ status: 200, type: [AuditLogDto] })
  async getAudit() {
    return this.comptabiliteService.getAudit();
  }
}