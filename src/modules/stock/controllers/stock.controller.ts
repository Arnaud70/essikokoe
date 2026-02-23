import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
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
import { StockInventoryResponseDto } from '../dtos/stock-inventory.dto';
import { StockByFormatResponseDto } from '../dtos/stock-by-format.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Stock')
@Controller('stock')
@ApiBearerAuth()
export class StockController {
  constructor(private stockService: StockService) {}

  /**
   *  Enregistrer une entrée de stock
   * @route POST /stock/entry
   */
  @Post('entry')
  @Roles('ADMIN', 'AGENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enregistrer une entrée de stock (livraison, retour, etc.)',
    description:
      'Ajoute des unités au stock d\'un produit avec traçabilité du motif',
  })
  @ApiBody({
    type: CreateStockEntryDto,
    examples: {
      livraison: {
        summary: 'Exemple: Livraison fournisseur',
        value: {
          codeProduit: 'PROD-001',
          quantite: 100,
          format: 'SACHET',
          motif: 'Livraison fournisseur',
        },
      },
      retour: {
        summary: 'Exemple: Retour client',
        value: {
          codeProduit: 'PROD-002',
          quantite: 25,
          format: 'BOUTEILLE',
          motif: 'Retour client défectueux',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Entrée de stock enregistrée avec succès',
    example: {
      message: 'Entrée de stock enregistrée avec succès',
      codeProduit: 'PROD-001',
      quantiteAjoutee: 100,
      nouveauStock: 550,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur de validation ou format incorrect',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  async registerEntry(@Body() dto: CreateStockEntryDto) {
    return await this.stockService.registerStockEntry(dto);
  }

  /**
   * 📤 Déduire du stock après vente
   * @route POST /stock/deduct
   */
  @Post('deduct')
  @Roles('ADMIN', 'AGENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réduire le stock après une vente',
    description:
      'Déduit automatiquement les unités vendues et déclenche alertes si seuil critique',
  })
  @ApiBody({
    type: DeductStockDto,
    examples: {
      vente_simple: {
        summary: 'Exemple: Vente simple',
        value: {
          codeProduit: 'PROD-001',
          quantite: 50,
          venteId: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Déduction de stock effectuée',
    example: {
      message: 'Déduction de stock effectuée',
      codeProduit: 'PROD-001',
      quantiteDeduite: 50,
      nouveauStock: 500,
      estCritique: false,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuffisant ou erreur de validation',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  async deductStock(@Body() dto: DeductStockDto) {
    return await this.stockService.deductStockAfterSale(dto);
  }

  /**
   * 👁️ Consulter l'inventaire complet
   * @route GET /stock/inventory
   */
  @Get('inventory')
  @Public()
  @Roles('ADMIN', 'AGENT', 'CLIENT')
  @ApiOperation({
    summary: 'Consulter l\'inventaire complet',
    description:
      'Retourne la liste de tous les produits avec leur stock actuel et alertes',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventaire récupéré avec succès',
    type: StockInventoryResponseDto,
  })
  async getInventory() {
    return await this.stockService.getInventory();
  }

  /**
   *  Stock par type de produit (SACHET / BOUTEILLE / BONBONNE)
   * @route GET /stock/by-format
   */
  @Get('by-format')
  @Public()
  @Roles('ADMIN', 'AGENT', 'CLIENT')
  @ApiOperation({
    summary: 'Stock agrégé par format de produit',
    description: 'Retourne les totaux pour SACHET, BOUTEILLE, BONBONNE',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock par format récupéré avec succès',
    type: StockByFormatResponseDto,
  })
  async getStockByFormat() {
    return await this.stockService.getStockByFormat();
  }

  /**
   *  Produits en alerte (seuils critiques)
   * @route GET /stock/critical
   */
  @Get('critical')
  @Public()
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({
    summary: 'Détail des produits en stock critique',
    description:
      'Retourne les produits dont le stock ≤ stockMinimum avec recommandations',
  })
  @ApiResponse({
    status: 200,
    description: 'Produits critiques récupérés',
    example: {
      produitsEnAlerte: [
        {
          codeProduit: 'PROD-003',
          nomProduit: 'Eau Esikokoé Bonbonne',
          format: 'BONBONNE',
          stockActuel: 80,
          stockMinimum: 100,
          prixUnitaire: 2500.0,
          estCritique: true,
          pourcentageDisponibilité: 44,
        },
      ],
      nombreAlertes: 1,
    },
  })
  async getCriticalStocks() {
    return await this.stockService.getCriticalStocks();
  }

  /**
   *  Métriques pour dashboard administrateur
   * @route GET /stock/dashboard
   */
  @Get('dashboard')  @Public()  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Métriques de stock pour tableau de bord',
    description:
      'Données clés: volume total, valeur, alertes, distribution par format, taux de couverture',
  })
  @ApiResponse({
    status: 200,
    description: 'Métriques dashboard récupérées',
    example: {
      stockTotal: 2500,
      valeurTotalStock: 1545250,
      produitsEnAlerte: 1,
      distribuitionParFormat: {
        SACHET: 1250,
        BOUTEILLE: 800,
        BONBONNE: 450,
      },
      tauxCouverture: 80,
    },
  })
  async getDashboardMetrics() {
    return await this.stockService.getStockDashboardMetrics();
  }

  /**
   *  Historique des mouvements de stock
   * @route GET /stock/history
   */
  @Get('history')
  @Public()
  @ApiOperation({
    summary: 'Historique des mouvements de stock',
    description:
      'Retourne la liste de tous les mouvements de stock (entrées et sorties)',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Nombre maximum de mouvements à retourner',
    example: 100,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Historique des mouvements récupéré',
    example: {
      total: 2,
      mouvements: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          date: '2024-01-15T14:30:00Z',
          produit: 'Eau Pure - Sachet',
          codeProduit: 'PROD-001',
          type: '+',
          typeLabel: 'ENTREE',
          quantite: 500,
          motif: 'Livraison fournisseur',
          reference: '550E8400',
          utilisateur: 'Admin',
        },
        {
          id: '650f9500-f40c-52e5-b827-557766551111',
          date: '2024-01-15T10:15:00Z',
          produit: 'Eau Pure - Bouteille 1.5L',
          codeProduit: 'PROD-002',
          type: '-',
          typeLabel: 'SORTIE',
          quantite: 25,
          motif: 'Vente',
          reference: '650F9500',
          utilisateur: 'Vendeur1',
        },
      ],
    },
  })
  async getStockHistory(@Query('limit') limit?: number) {
    return await this.stockService.getStockMovementHistory(limit || 100);
  }
}
