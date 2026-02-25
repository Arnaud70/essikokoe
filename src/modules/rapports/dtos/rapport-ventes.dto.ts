import { ApiProperty } from '@nestjs/swagger';

export class RapportVentesDto {
  @ApiProperty({ example: 150000, description: 'Chiffre d\'affaires total' })
  chiffreAffaires: number;

  @ApiProperty({ example: 25, description: 'Nombre total de ventes' })
  nombreVentes: number;

  @ApiProperty({ 
    example: 6000,
    description: 'Montant moyen par vente'
  })
  montantMoyenVente: number;

  @ApiProperty({
    example: [
      { codeProduit: 'PROD-001', nomProduit: 'Eau Sachet', quantiteVendue: 500 },
      { codeProduit: 'PROD-002', nomProduit: 'Eau Carton', quantiteVendue: 200 }
    ],
    description: 'Top 5 produits les plus vendus'
  })
  topProduits: Array<{
    codeProduit: string;
    nomProduit: string;
    quantiteVendue: number;
  }>;

  @ApiProperty({
    example: [
      { nomClient: 'Client A', nombreCommandes: 5, montantTotal: 50000 },
      { nomClient: 'Client B', nombreCommandes: 3, montantTotal: 30000 }
    ],
    description: 'Top clients par montant'
  })
  topClients: Array<{
    nomClient: string;
    nombreCommandes: number;
    montantTotal: number;
  }>;

  @ApiProperty({
    example: { ESPECES: 80000, CHEQUE: 50000, VIREMENT: 20000 },
    description: 'Répartition par mode de paiement'
  })
  repartitionPaiement: Record<string, number>;
}
