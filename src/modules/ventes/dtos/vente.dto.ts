import { ApiProperty } from '@nestjs/swagger';

export class VenteDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idVente: string;

  @ApiProperty({ example: 'F-2024-089' })
  numeroFacture: string;

  @ApiProperty({ example: '2024-01-15T14:30:00Z' })
  date: Date;

  @ApiProperty({ example: 'Restaurant Le Palmier' })
  client: string;

  @ApiProperty({ example: 10000, description: 'Sous-total (avant TVA)' })
  sousTotal: number;

  @ApiProperty({ example: 1800, description: 'TVA 18%' })
  tva: number;

  @ApiProperty({ example: 11800, description: 'Total TTC' })
  montant: number;

  @ApiProperty({ example: 'Espèces' })
  modePaiement: string;

  @ApiProperty({ example: 'Payée', enum: ['Payée', 'En attente'] })
  statut: string;
}

export class VenteDetailDto extends VenteDto {
  @ApiProperty({
    example: [
      {
        codeProduit: 'PROD-001',
        nomProduit: 'Eau Pure - Sachet',
        quantite: 50,
        prixUnitaire: 500.5,
        totalLigne: 25025,
      },
    ],
  })
  produits: Array<{
    codeProduit: string;
    nomProduit: string;
    quantite: number;
    prixUnitaire: number;
    totalLigne: number;
  }>;

  @ApiProperty({ example: '+225 01 23 45 67 89' })
  telephone: string;

  @ApiProperty({ example: 'Abidjan, Plateau, Rue de la Paix' })
  adresse: string;
}

export class VenteListResponseDto {
  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({
    type: [VenteDto],
    example: [
      {
        idVente: '550e8400-e29b-41d4-a716-446655440000',
        numeroFacture: 'F-2024-089',
        date: '2024-01-15T14:30:00Z',
        client: 'Restaurant Le Palmier',
        montant: 11800,
        modePaiement: 'Espèces',
        statut: 'Payée',
      },
    ],
  })
  ventes: VenteDto[];
}
