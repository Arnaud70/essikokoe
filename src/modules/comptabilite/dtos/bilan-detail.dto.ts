import { ApiProperty } from '@nestjs/swagger';

export class BilanDetailDto {
  @ApiProperty({
    description: 'Détails des actifs',
    example: {
      tresorerie: 500000,
      stock: 2500000,
      creancesClients: 150000,
      totalActifs: 3150000,
    },
  })
  actifs: {
    tresorerie: number;
    stock: number;
    creancesClients: number;
    totalActifs: number;
  };

  @ApiProperty({
    description: 'Détails des passifs',
    example: {
      dettesFournisseurs: 300000,
      chargesAPayer: 50000,
      capital: 2000000,
      totalPassifs: 2350000,
    },
  })
  passifs: {
    dettesFournisseurs: number;
    chargesAPayer: number;
    capital: number;
    totalPassifs: number;
  };

  @ApiProperty({
    description: 'Résultat (Total Actifs - Total Passifs)',
    example: 800000,
  })
  resultat: number;
}
