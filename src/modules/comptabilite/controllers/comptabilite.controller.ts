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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ComptabiliteService } from '../services/comptabilite.service';
import { Public } from '../../../auth/decorators/public.decorator';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { CreateRapportDto } from '../dtos/create-rapport.dto';
import { CreateBilanDto } from '../dtos/create-bilan.dto';
import { TransactionResponseDto } from '../dtos/transaction.dto';
import { RapportResponseDto } from '../dtos/rapport.dto';
import { BilanResponseDto } from '../dtos/bilan.dto';
import { AuditLogDto } from '../dtos/audit-log.dto';

@ApiTags('Comptabilité')
@Controller('comptabilite')
export class ComptabiliteController {
  constructor(private readonly comptabiliteService: ComptabiliteService) {}

  // ===== TRANSACTIONS =====
  
  @Post('transactions')
  @Public()
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

  // ===== RAPPORTS =====
  
  @Get('rapports')
  @Public()
  @ApiOperation({ summary: 'Lister les rapports comptables' })
  @ApiResponse({ status: 200, description: 'Liste des rapports' })
  async getRapports() {
    return this.comptabiliteService.getRapports();
  }

  @Post('rapports')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un rapport (journalier/mensuel)' })
  @ApiBody({ type: CreateRapportDto })
  @ApiResponse({ status: 201, type: RapportResponseDto })
  async createRapport(@Body() dto: CreateRapportDto) {
    return this.comptabiliteService.createRapport(dto);
  }

  // ===== BILAN =====
  
  @Get('bilan')
  @Public()
  @ApiOperation({ summary: 'Lister les bilans' })
  @ApiResponse({ status: 200, description: 'Liste des bilans' })
  async getBilans() {
    return this.comptabiliteService.getBilans();
  }

  @Post('bilan')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un bilan comptable' })
  @ApiBody({ type: CreateBilanDto })
  @ApiResponse({ status: 201, type: BilanResponseDto })
  async createBilan(@Body() dto: CreateBilanDto) {
    return this.comptabiliteService.createBilan(dto);
  }

  // ===== AUDIT =====
  
  @Get('audit')
  @Public()
  @ApiOperation({ summary: 'Voir les logs d\'audit' })
  @ApiResponse({ status: 200, type: [AuditLogDto] })
  async getAudit() {
    return this.comptabiliteService.getAudit();
  }
}