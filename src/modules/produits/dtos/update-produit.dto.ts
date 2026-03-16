import { IsString, IsEnum, IsInt, IsPositive, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProduitType } from '@prisma/client';

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
    description: 'Format du produit',
    example: 'SACHET',
    required: false,
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({
    description: 'Type de produit',
    enum: ProduitType,
    example: 'VENTE',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProduitType)
  type?: ProduitType;

  @ApiProperty({
    description: 'Catégorie du produit',
    example: 'Eau minérale Premium',
    required: false,
  })
  @IsOptional()
  @IsString()
  categorie?: string;

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

  // Optionnels (non sauvegardés directement sur Produit mais envoyés par le front)
  @IsOptional()
  @IsInt()
  stockMinimum?: number;

  @IsOptional()
  @IsInt()
  stockInitial?: number;
}
