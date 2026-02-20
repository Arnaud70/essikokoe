import { ApiProperty } from '@nestjs/swagger';

export class ProduitsByFormatDto {
  @ApiProperty({ example: 'SACHET' })
  format: string;

  @ApiProperty({ example: 3 })
  nombreProduits: number;

  @ApiProperty({ example: 1501.5 })
  prixMoyenUnitaire: number;
}

export class ProduitsByFormatResponseDto {
  @ApiProperty({
    type: [ProduitsByFormatDto],
    example: [
      {
        format: 'SACHET',
        nombreProduits: 3,
        prixMoyenUnitaire: 500.5,
      },
      {
        format: 'BOUTEILLE',
        nombreProduits: 2,
        prixMoyenUnitaire: 750.0,
      },
    ],
  })
  parFormat: ProduitsByFormatDto[];

  @ApiProperty({ example: 5 })
  totalProduits: number;
}
