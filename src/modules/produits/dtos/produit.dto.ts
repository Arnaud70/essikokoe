import { ApiProperty } from '@nestjs/swagger';

export class ProduitDto {
  @ApiProperty({ example: 'PROD-001' })
  codeProduit: string;

  @ApiProperty({ example: 'Eau Esikokoé - Sachet' })
  nomProduit: string;

  @ApiProperty({ example: 'SACHET' })
  format: string;

  @ApiProperty({ example: 'Eau minérale' })
  categorie: string;

  @ApiProperty({ example: 1000 })
  stockInitial: number;

  @ApiProperty({ example: 100 })
  stockMinimum: number;

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
        categorie: 'Eau minérale',
        stockInitial: 1000,
        stockMinimum: 100,
        prixUnitaire: 500.5,
        fournisseur: 'Fournisseur Principal SARL',
      },
    ],
  })
  produits: ProduitDto[];
}
