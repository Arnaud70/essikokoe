import { ApiProperty } from '@nestjs/swagger';

export class RapportComptabiliteDto {
  @ApiProperty({ 
    example: 150000,
    description: 'Montant total des recettes'
  })
  totalRecettes: number;

  @ApiProperty({
    example: 45000,
    description: 'Montant total des dépenses'
  })
  totalDepenses: number;

  @ApiProperty({
    example: 105000,
    description: 'Solde net (Recettes - Dépenses)'
  })
  soldeNet: number;

  @ApiProperty({
    example: 25,
    description: 'Nombre de transactions enregistrées'
  })
  nombreTransactions: number;

  @ApiProperty({
    example: { RECETTE: 18, DEPENSE: 7 },
    description: 'Répartition par type de transaction'
  })
  repartitionTransactions: Record<string, number>;

  @ApiProperty({
    example: {
      SALAIRES: 20000,
      TRANSPORT: 15000,
      AMENAGEMENT: 10000
    },
    description: 'Dépenses par catégorie'
  })
  depensesParCategorie: Record<string, number>;

  @ApiProperty({
    example: {
      VENTES: 150000,
      AUTRES: 0
    },
    description: 'Recettes par catégorie'
  })
  recettesParCategorie: Record<string, number>;

  @ApiProperty({
    example: [
      {
        date: '2026-02-20',
        typeTransaction: 'RECETTE',
        montant: 25000,
        description: 'Ventes du jour'
      },
      {
        date: '2026-02-19',
        typeTransaction: 'DEPENSE',
        montant: 5000,
        description: 'Achat de fournitures'
      }
    ],
    description: 'Dernières transactions (10 dernières)'
  })
  derniereTransactions: Array<{
    date: string;
    typeTransaction: string;
    montant: number;
    description: string;
  }>;
}
