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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
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
  constructor(private produitsService: ProduitsService) { }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister tous les produits' })
  async getAllProduits(@Request() req: any) {
    return await this.produitsService.getAllProduits(req.user);
  }

  @Get('search/query')
  @Public()
  @ApiOperation({ summary: 'Rechercher des produits' })
  async searchProduits(@Query('q') query: string) {
    return await this.produitsService.searchProduits(query);
  }

  @Get('filter/format')
  @Public()
  @ApiOperation({ summary: 'Filtrer les produits par format' })
  async getProduitsByFormat(@Query('format') format: string) {
    return await this.produitsService.getProduitsByFormat(format as any);
  }

  @Get('stats/by-format')
  @Public()
  @ApiOperation({ summary: 'Statistiques agrégées par format' })
  async getStatsByFormat(): Promise<ProduitsByFormatResponseDto> {
    return await this.produitsService.getStatsByFormat();
  }

  @Post()
  @Roles('SUPERADMIN', 'GERANT', 'RESPONSABLE_ACHAT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  async create(@Body() dto: CreateProduitDto, @Request() req: any) {
    return await this.produitsService.createProduit(dto, req.user);
  }

  @Get(':codeProduit')
  @Public()
  @ApiOperation({ summary: 'Détails d\'un produit' })
  async getProduitByCode(@Param('codeProduit') codeProduit: string) {
    return await this.produitsService.getProduitByCode(codeProduit);
  }

  @Put(':codeProduit')
  @Roles('SUPERADMIN', 'GERANT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Modifier un produit' })
  async update(
    @Param('codeProduit') codeProduit: string,
    @Body() dto: UpdateProduitDto,
  ) {
    return await this.produitsService.updateProduit(codeProduit, dto);
  }

  @Delete(':codeProduit')
  @Roles('SUPERADMIN', 'GERANT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un produit' })
  async delete(@Param('codeProduit') codeProduit: string) {
    return await this.produitsService.deleteProduit(codeProduit);
  }
}
