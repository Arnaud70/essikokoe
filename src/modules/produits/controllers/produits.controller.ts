import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProduitsService } from '../services/produits.service';
import { CreateProduitDto } from '../dtos/create-produit.dto';
import { UpdateProduitDto } from '../dtos/update-produit.dto';
import { ProduitListResponseDto } from '../dtos/produit.dto';
import { ProduitsByFormatResponseDto } from '../dtos/produits-by-format.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Produits')
@Controller('produits')
@ApiBearerAuth()
export class ProduitsController {
  constructor(private produitsService: ProduitsService) {}

  // ============= ROUTES SPÉCIFIQUES (AVANT parametrées) =============

  /**
   * 🔍 RECHERCHER DES PRODUITS
   */
  @Get('search/query')
  @Public()
  @ApiOperation({
    summary: 'Rechercher des produits',
    description:
      'Recherche les produits par code, nom ou fournisseur (insensible à la casse)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Terme de recherche',
    example: 'Esikokoé',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats de la recherche',
    type: ProduitListResponseDto,
  })
  async searchProduits(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new Error('La requête doit contenir au moins 2 caractères');
    }
    return await this.produitsService.searchProduits(query);
  }

  /**
   * 🏷️ FILTRER PAR FORMAT
   */
  @Get('filter/format')
  @Public()
  @ApiOperation({
    summary: 'Filtrer produits par format',
    description: 'Retourne tous les produits d\'un format spécifique',
  })
  @ApiQuery({
    name: 'format',
    description: 'Format du produit',
    enum: ['SACHET', 'BOUTEILLE', 'BONBONNE'],
    example: 'SACHET',
  })
  @ApiResponse({
    status: 200,
    description: 'Produits du format spécifié',
    type: ProduitListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Aucun produit trouvé' })
  async getProduitsByFormat(@Query('format') format: string) {
    return await this.produitsService.getProduitsByFormat(format);
  }

  /**
   * 📊 STATISTIQUES PAR FORMAT
   */
  @Get('stats/by-format')
  @Public()
  @ApiOperation({
    summary: 'Statistiques des produits par format',
    description:
      'Retourne le nombre de produits et prix moyen unitaire par format',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques par format',
    type: ProduitsByFormatResponseDto,
  })
  async getStatsByFormat() {
    return await this.produitsService.getStatsByFormat();
  }

  /**
   * 📈 MÉTRIQUES DASHBOARD
   */
  @Get('dashboard/metrics')
  @Public()
  @ApiOperation({
    summary: 'Métriques produits pour dashboard',
    description:
      'Données analytiques: total produits, distribution formats, prix moyen, valeur stock, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métriques dashboard',
    example: {
      totalProduits: 5,
      produitsParFormat: {
        SACHET: 3,
        BOUTEILLE: 2,
      },
      prixMoyenUnitaire: 600.3,
      stockMoyenParProduit: 350,
      valeurTotalStock: 1050600,
    },
  })
  async getDashboardMetrics() {
    return await this.produitsService.getProduitsDashboardMetrics();
  }

  // ============= ROUTES GÉNÉRALES (POST, GET ALL, GET BY ID, PUT, DELETE) =============

  /**
   * 🆕 CRÉER UN NOUVEAU PRODUIT
   */
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau produit',
    description:
      'Ajoute un nouveau produit au catalogue avec tous ses paramètres (stock, prix, format, etc.)',
  })
  @ApiBody({
    type: CreateProduitDto,
    examples: {
      sachet: {
        summary: 'Exemple: Eau en sachet',
        value: {
          codeProduit: 'PROD-001',
          nomProduit: 'Eau Esikokoé - Sachet',
          format: 'SACHET',
          categorie: 'Eau minérale',
          stockInitial: 500,
          stockMinimum: 100,
          prixUnitaire: 500.5,
          fournisseur: 'Fournisseur Principal SARL',
        },
      },
      bouteille: {
        summary: 'Exemple: Eau en bouteille',
        value: {
          codeProduit: 'PROD-002',
          nomProduit: 'Eau Esikokoé - Bouteille 1L',
          format: 'BOUTEILLE',
          categorie: 'Eau minérale',
          stockInitial: 300,
          stockMinimum: 50,
          prixUnitaire: 750.0,
          fournisseur: 'Fournisseur Principal SARL',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Produit créé avec succès',
    example: {
      message: 'Produit créé avec succès',
      produit: {
        codeProduit: 'PROD-001',
        nomProduit: 'Eau Esikokoé - Sachet',
        format: 'SACHET',
        categorie: 'Eau minérale',
        stockInitial: 500,
        stockMinimum: 100,
        prixUnitaire: 500.5,
        fournisseur: 'Fournisseur Principal SARL',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Code produit déjà existant' })
  async create(@Body() dto: CreateProduitDto) {
    return await this.produitsService.createProduit(dto);
  }

  /**
   * 📋 LISTER TOUS LES PRODUITS
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lister tous les produits',
    description: 'Retourne la liste complète des produits du catalogue',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de tous les produits',
    type: ProduitListResponseDto,
  })
  async getAllProduits() {
    return await this.produitsService.getAllProduits();
  }

  /**
   * 📖 RÉCUPÉRER UN PRODUIT PAR CODE
   */
  @Get(':codeProduit')
  @Public()
  @ApiOperation({
    summary: 'Récupérer un produit par son code',
    description: 'Affiche les détails complets d\'un produit spécifique',
  })
  @ApiParam({
    name: 'codeProduit',
    description: 'Code unique du produit',
    example: 'PROD-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Produit trouvé',
    example: {
      codeProduit: 'PROD-001',
      nomProduit: 'Eau Esikokoé - Sachet',
      format: 'SACHET',
      categorie: 'Eau minérale',
      stockInitial: 500,
      stockMinimum: 100,
      prixUnitaire: 500.5,
      fournisseur: 'Fournisseur Principal SARL',
    },
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async getProduitByCode(@Param('codeProduit') codeProduit: string) {
    return await this.produitsService.getProduitByCode(codeProduit);
  }

  /**
   * ✏️ METTRE À JOUR UN PRODUIT
   */
  @Put(':codeProduit')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour un produit',
    description:
      'Modifie les informations d\'un produit existant (sauf le code)',
  })
  @ApiParam({
    name: 'codeProduit',
    description: 'Code unique du produit',
    example: 'PROD-001',
  })
  @ApiBody({
    type: UpdateProduitDto,
    examples: {
      exemple1: {
        summary: 'Exemple: Mise à jour du prix',
        value: {
          prixUnitaire: 600.0,
        },
      },
      exemple2: {
        summary: 'Exemple: Mise à jour du stock minimum',
        value: {
          stockMinimum: 150,
          nomProduit: 'Eau Esikokoé - Sachet Réservé',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Produit mis à jour avec succès',
    example: {
      message: 'Produit mis à jour avec succès',
      produit: {
        codeProduit: 'PROD-001',
        nomProduit: 'Eau Esikokoé - Sachet',
        prixUnitaire: 600.0,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async updateProduit(
    @Param('codeProduit') codeProduit: string,
    @Body() dto: UpdateProduitDto,
  ) {
    return await this.produitsService.updateProduit(codeProduit, dto);
  }

  /**
   * 🗑️ SUPPRIMER UN PRODUIT
   */
  @Delete(':codeProduit')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un produit',
    description:
      'Supprime un produit du catalogue (impossible si lié à des commandes)',
  })
  @ApiParam({
    name: 'codeProduit',
    description: 'Code unique du produit',
    example: 'PROD-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Produit supprimé avec succès',
    example: {
      message: 'Produit supprimé avec succès',
    },
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  @ApiResponse({
    status: 400,
    description: 'Impossible à supprimer (présent dans des commandes)',
  })
  async deleteProduit(@Param('codeProduit') codeProduit: string) {
    return await this.produitsService.deleteProduit(codeProduit);
  }
}
