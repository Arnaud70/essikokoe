import { IsString, IsEnum, IsInt, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Format } from '@prisma/client';

export class CreateProduitDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Eau Pure',
  })
  @IsString()
  nomProduit: string;

  @ApiProperty({
    description: 'Format de distribution',
    enum: ['SACHET', 'BOUTEILLE', 'BONBONNE'],
    example: 'BOUTEILLE',
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
    example: 0,
    type: 'integer',
  })
  @IsInt()
  @IsPositive()
  stockInitial: number;

  @ApiProperty({
    description: 'Stock minimum pour alerte',
    example: 0,
    type: 'integer',
  })
  @IsInt()
  @IsPositive()
  stockMinimum: number;

  @ApiProperty({
    description: 'Prix unitaire en FCFA',
    example: 0,
    type: 'number',
  })
  @IsPositive()
  prixUnitaire: number;

  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'Nom du fournisseur',
  })
  @IsString()
  fournisseur: string;
}
