import { ApiProperty } from '@nestjs/swagger';

export class StockInventoryDto {
  @ApiProperty({ example: 'PROD-001' })
  codeProduit: string;

  @ApiProperty({ example: 'Eau Esikokoé' })
  nomProduit: string;

  @ApiProperty({ example: 'SACHET' })
  format: string;

  @ApiProperty({ example: 450 })
  stockActuel: number;

  @ApiProperty({ example: 100 })
  stockMinimum: number;

  @ApiProperty({ example: 500.50 })
  prixUnitaire: number;

  @ApiProperty({ example: false })
  estCritique: boolean;

  @ApiProperty({ example: 82 })
  pourcentageDisponibilité: number;
}

export class StockInventoryResponseDto {
  @ApiProperty({ example: 5 })
  totalProduits: number;

  @ApiProperty({ example: 2500 })
  stockTotal: number;

  @ApiProperty({ example: 1 })
  produitsEnAlerte: number;

  @ApiProperty({
    type: [StockInventoryDto],
    example: [
      {
        codeProduit: 'PROD-001',
        nomProduit: 'Eau Esikokoé Sachet',
        format: 'SACHET',
        stockActuel: 450,
        stockMinimum: 100,
        prixUnitaire: 500.5,
        estCritique: false,
        pourcentageDisponibilité: 82,
      },
    ],
  })
  inventaire: StockInventoryDto[];
}
