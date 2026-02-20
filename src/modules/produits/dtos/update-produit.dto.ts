import { IsString, IsEnum, IsInt, IsPositive, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Format } from '@prisma/client';

export class UpdateProduitDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Eau Esikokoé - Sachet Premium',
    required: false,
  })
  @IsOptional()
  @IsString()
  nomProduit?: string;

  @ApiProperty({
    description: 'Catégorie du produit',
    example: 'Eau minérale Premium',
    required: false,
  })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiProperty({
    description: 'Stock minimum pour alerte',
    example: 150,
    type: 'integer',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  stockMinimum?: number;

  @ApiProperty({
    description: 'Prix unitaire en FCFA',
    example: 550.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  prixUnitaire?: number;

  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'Nouveau Fournisseur Inc',
    required: false,
  })
  @IsOptional()
  @IsString()
  fournisseur?: string;
}
