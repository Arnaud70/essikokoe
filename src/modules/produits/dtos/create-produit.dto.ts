import { IsString, IsEnum, IsInt, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Format } from '@prisma/client';

export class CreateProduitDto {
  @ApiProperty({
    description: 'Code unique du produit',
    example: 'PROD-001',
  })
  @IsString()
  codeProduit: string;

  @ApiProperty({
    description: 'Nom du produit',
    example: 'Eau Esikokoé - Sachet',
  })
  @IsString()
  nomProduit: string;

  @ApiProperty({
    description: 'Format de distribution',
    enum: ['SACHET', 'BOUTEILLE', 'BONBONNE'],
    example: 'SACHET',
  })
  @IsEnum(Format)
  format: Format;

  @ApiProperty({
    description: 'Catégorie du produit',
    example: 'Eau minérale',
  })
  @IsString()
  categorie: string;

  @ApiProperty({
    description: 'Stock initial du produit',
    example: 1000,
    type: 'integer',
  })
  @IsInt()
  @IsPositive()
  stockInitial: number;

  @ApiProperty({
    description: 'Stock minimum pour alerte',
    example: 100,
    type: 'integer',
  })
  @IsInt()
  @IsPositive()
  stockMinimum: number;

  @ApiProperty({
    description: 'Prix unitaire en FCFA',
    example: 500.5,
    type: 'number',
  })
  @IsPositive()
  prixUnitaire: number;

  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'Fournisseur Principal SARL',
  })
  @IsString()
  fournisseur: string;
}
