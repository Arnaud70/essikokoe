import { IsString, IsInt, IsPositive, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Format } from '@prisma/client';

export class CreateStockEntryDto {
  @ApiProperty({
    description: 'Code unique du produit',
    example: 'PROD-001',
  })
  @IsString()
  codeProduit: string;

  @ApiProperty({
    description: 'Quantité à ajouter au stock',
    example: 100,
    type: 'integer',
  })
  @IsInt()
  @IsPositive()
  quantite: number;

  @ApiProperty({
    description: 'Format du produit',
    enum: ['SACHET', 'BOUTEILLE', 'BONBONNE'],
    example: 'SACHET',
  })
  @IsEnum(Format)
  format: Format;

  @ApiProperty({
    description: 'Motif de l\'entrée de stock',
    example: 'Livraison fournisseur',
  })
  @IsString()
  motif: string;
}
