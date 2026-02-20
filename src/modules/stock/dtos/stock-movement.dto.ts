import { ApiProperty } from '@nestjs/swagger';

export class StockMovementDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'PROD-001' })
  codeProduit: string;

  @ApiProperty({ example: 'Eau Esikokoé Sachet' })
  nomProduit: string;

  @ApiProperty({ enum: ['ENTREE', 'SORTIE'], example: 'ENTREE' })
  type: 'ENTREE' | 'SORTIE';

  @ApiProperty({ example: 100 })
  quantite: number;

  @ApiProperty({ example: 'Livraison fournisseur' })
  motif: string;

  @ApiProperty({ example: '2026-02-18T10:30:00Z' })
  dateMovement: Date;

  @ApiProperty({ example: 350 })
  stockAvant: number;

  @ApiProperty({ example: 450 })
  stockApres: number;
}

export class StockMovementResponseDto {
  @ApiProperty({
    type: [StockMovementDto],
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        codeProduit: 'PROD-001',
        nomProduit: 'Eau Esikokoé Sachet',
        type: 'ENTREE',
        quantite: 100,
        motif: 'Livraison fournisseur',
        dateMovement: '2026-02-18T10:30:00Z',
        stockAvant: 350,
        stockApres: 450,
      },
    ],
  })
  mouvements: StockMovementDto[];

  @ApiProperty({ example: 1 })
  total: number;
}
