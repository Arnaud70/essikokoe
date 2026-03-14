import { IsString, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: 'SACHET',
  })
  @IsString()
  format: string;

  @ApiProperty({
    description: 'Motif de l\'entrée de stock',
    example: 'Livraison fournisseur',
  })
  @IsString()
  motif: string;
}
