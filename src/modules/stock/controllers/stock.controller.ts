import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { StockService } from '../services/stock.service';
import { CreateStockEntryDto } from '../dtos/create-stock-entry.dto';
import { DeductStockDto } from '../dtos/deduct-stock.dto';
import { TransferStockDto } from '../dtos/transfer-stock.dto';
import { StockInventoryResponseDto } from '../dtos/stock-inventory.dto';
import { StockByFormatResponseDto } from '../dtos/stock-by-format.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Stock')
@Controller('stock')
@ApiBearerAuth()
export class StockController {
  constructor(private stockService: StockService) { }

  /**
   *  Enregistrer une entrée de stock
   * @route POST /stock/entry
   */
  @Post('entry')
  @Roles('SUPERADMIN', 'GERANT', 'MAGASINIER', 'RESPONSABLE_ACHAT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enregistrer une entrée de stock (livraison, retour, etc.)',
    description:
      'Ajoute des unités au stock d\'un produit avec traçabilité du motif',
  })
  @ApiResponse({
    status: 201,
    description: 'Entrée de stock enregistrée avec succès',
  })
  async registerEntry(@Body() dto: CreateStockEntryDto, @Request() req: any) {
    return await this.stockService.registerStockEntry(dto, req.user);
  }

  /**
   *  Déduire du stock après vente
   * @route POST /stock/deduct
   */
  @Post('deduct')
  @Roles('SUPERADMIN', 'GERANT', 'MAGASINIER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réduire le stock après une vente',
  })
  async deductStock(@Body() dto: DeductStockDto, @Request() req: any) {
    return await this.stockService.deductStock(dto, req.user);
  }

  /**
   * 👁️ Consulter l'inventaire complet
   * @route GET /stock/inventory
   */
  @Get('inventory')
  @Roles('SUPERADMIN', 'GERANT', 'MAGASINIER', 'VENDEUR', 'RESPONSABLE_ACHAT')
  @ApiOperation({
    summary: "Consulter l'inventaire complet",
  })
  @ApiResponse({
    status: 200,
    type: StockInventoryResponseDto,
  })
  async getInventory(@Request() req: any) {
    return await this.stockService.getInventory(req.user);
  }

  /**
   *  Stock par type de produit
   * @route GET /stock/by-format
   */
  @Get('by-format')
  @Roles('SUPERADMIN', 'GERANT', 'MAGASINIER')
  @ApiOperation({
    summary: 'Stock agrégé par format de produit',
  })
  @ApiResponse({
    status: 200,
    type: StockByFormatResponseDto,
  })
  async getStockByFormat(@Request() req: any) {
    return await this.stockService.getStockByFormat(req.user);
  }

  /**
   *  Produits en alerte (seuils critiques)
   * @route GET /stock/critical
   */
  @Get('critical')
  @Roles('SUPERADMIN', 'GERANT', 'MAGASINIER')
  @ApiOperation({
    summary: 'Détail des produits en stock critique',
  })
  async getCriticalStocks(@Request() req: any) {
    return await this.stockService.getCriticalStocks(req.user);
  }

  /**
   *  Métriques pour dashboard
   * @route GET /stock/dashboard
   */
  @Get('dashboard')
  @Roles('SUPERADMIN', 'GERANT', 'VENDEUR', 'RESPONSABLE_ACHAT', 'MAGASINIER')
  @ApiOperation({
    summary: 'Métriques de stock pour tableau de bord',
  })
  async getDashboardMetrics(@Request() req: any) {
    return await this.stockService.getStockDashboardMetrics(req.user);
  }

  /**
   *  Historique des mouvements de stock
   * @route GET /stock/history
   */
  @Get('history')
  @Roles('SUPERADMIN', 'GERANT', 'MAGASINIER')
  @ApiOperation({
    summary: 'Historique des mouvements de stock',
  })
  async getStockHistory(@Query('limit') limit: number, @Request() req: any) {
    return await this.stockService.getStockMovementHistory(req.user, limit || 100);
  }

  /**
   * 📉 Enregistrer un transfert/distribution de stock
   */
  @Post('transfer')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Transférer ou distribuer du stock entre magasins (SUPERADMIN)' })
  async transferStock(@Body() dto: TransferStockDto, @Request() req: any) {
    return this.stockService.transferStock(dto, req.user);
  }

  /**
   * 📜 Consulter l'historique des transferts
   */
  @Get('transfers')
  @Roles('SUPERADMIN', 'GERANT')
  @ApiOperation({ summary: 'Lister les transferts/distributions effectués' })
  async getTransfers(@Request() req: any) {
    return this.stockService.getTransferHistory(req.user);
  }
}
