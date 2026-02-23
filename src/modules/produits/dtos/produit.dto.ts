import { ApiProperty } from '@nestjs/swagger';

export class ProduitDto {
  @ApiProperty({ example: 'PROD-001' })
  codeProduit: string;

  @ApiProperty({ example: 'Eau Esikokoé - Sachet' })
  nomProduit: string;

  @ApiProperty({ example: 'SACHET' })
  format: string;

  @ApiProperty({ example: 950 })
  stock: number;

  @ApiProperty({ example: 'En stock', enum: ['En stock', 'Stock Faible'] })
  statut: string;

  @ApiProperty({ example: 500.5 })
  prixUnitaire: number;

  @ApiProperty({ example: 'Fournisseur Principal SARL' })
  fournisseur: string;
}

export class ProduitListResponseDto {
  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({
    type: [ProduitDto],
    example: [
      {
        codeProduit: 'PROD-001',
        nomProduit: 'Eau Esikokoé - Sachet',
        format: 'SACHET',
        stock: 950,
        statut: 'En stock',
        prixUnitaire: 500.5,
        fournisseur: 'Fournisseur Principal SARL',
      },
    ],
  })
  produits: ProduitDto[];
}
