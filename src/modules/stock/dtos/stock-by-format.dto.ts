import { ApiProperty } from '@nestjs/swagger';

export class StockByFormatDto {
  @ApiProperty({ example: 'SACHET' })
  format: string;

  @ApiProperty({ example: 1250 })
  quantite: number;

  @ApiProperty({ example: 3 })
  nombreProduits: number;

  @ApiProperty({ example: 625250 })
  valeurTotale: number;
}

export class StockByFormatResponseDto {
  @ApiProperty({
    type: [StockByFormatDto],
    example: [
      {
        format: 'SACHET',
        quantite: 1250,
        nombreProduits: 3,
        valeurTotale: 625250,
      },
      {
        format: 'BOUTEILLE',
        quantite: 800,
        nombreProduits: 2,
        valeurTotale: 920000,
      },
    ],
  })
  parFormat: StockByFormatDto[];

  @ApiProperty({ example: 2050 })
  totalUnites: number;

  @ApiProperty({ example: 1545250 })
  valeurTotalStock: number;
}
