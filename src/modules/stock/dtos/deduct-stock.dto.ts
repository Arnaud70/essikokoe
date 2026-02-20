import { IsString, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeductStockDto {
  @ApiProperty({
    description: 'Code unique du produit',
    example: 'PROD-001',
  })
  @IsString()
  codeProduit: string;

  @ApiProperty({
    description: 'Quantité à déduire du stock',
    example: 50,
    type: 'integer',
  })
  @IsInt()
  @IsPositive()
  quantite: number;

  @ApiProperty({
    description: 'ID unique de la vente associée',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  venteId: string;
}
