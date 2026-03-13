import { IsString, IsEnum, IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Format, ProduitType } from '@prisma/client';

export class CreateProduitDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Eau Pure 0.5L',
  })
  @IsString()
  nomProduit: string;

  @ApiProperty({
    description: 'Format de distribution',
    enum: Format,
    example: 'BOUTEILLE',
  })
  @IsEnum(Format)
  format: Format;

  @ApiProperty({
    description: 'Type de produit',
    enum: ProduitType,
    example: 'VENTE',
  })
  @IsEnum(ProduitType)
  type: ProduitType;

  @ApiProperty({
    description: 'Catégorie du produit',
    example: 'Eau minérale',
  })
  @IsString()
  categorie: string;

  @ApiProperty({
    description: 'Stock initial du produit',
    example: 100,
    type: 'integer',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  stockInitial?: number;

  @ApiProperty({
    description: 'Stock minimum pour alerte',
    example: 10,
    type: 'integer',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  stockMinimum?: number;

  @ApiProperty({
    description: 'Prix unitaire en FCFA',
    example: 500,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'Source Centrale',
  })
  @IsString()
  fournisseur: string;

  @ApiProperty({
    description: 'ID du magasin pour le stock initial (optionnel)',
    example: 'uuid-magasin',
    required: false,
  })
  @IsOptional()
  @IsString()
  magasinId?: string;
}
