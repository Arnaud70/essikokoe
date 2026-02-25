import { ApiProperty } from '@nestjs/swagger';

export class RapportProduitsDto {
  @ApiProperty({ example: 10, description: 'Nombre total de produits' })
  nombreProduits: number;

  @ApiProperty({ example: 15280, description: 'Stock total tous produits' })
  stockTotal: number;

  @ApiProperty({ example: 3, description: 'Nombre de produits en rupture' })
  nombreRuptures: number;

  @ApiProperty({ 
    example: 2,
    description: 'Nombre de produits en stock faible'
  })
  stockFaible: number;

  @ApiProperty({
    example: [
      { codeProduit: 'PROD-005', nomProduit: 'Eau 20L', stockActuel: 0 },
      { codeProduit: 'PROD-003', nomProduit: 'Eau Bouteille', stockActuel: 0 }
    ],
    description: 'Produits en rupture'
  })
  produitEnRupture: Array<{
    codeProduit: string;
    nomProduit: string;
    stockActuel: number;
  }>;

  @ApiProperty({
    example: [
      { codeProduit: 'PROD-002', nomProduit: 'Eau Carton', stockActuel: 150, stockMinimum: 200 },
      { codeProduit: 'PROD-004', nomProduit: 'Eau Vrac', stockActuel: 180, stockMinimum: 300 }
    ],
    description: 'Produits avec stock faible'
  })
  produitsStockFaible: Array<{
    codeProduit: string;
    nomProduit: string;
    stockActuel: number;
    stockMinimum: number;
  }>;

  @ApiProperty({
    example: { SACHET: 5000, CARTON: 4280, BOUTEILLE: 3000, VRAC: 3000 },
    description: 'Distribution du stock par format'
  })
  stockParFormat: Record<string, number>;
}
