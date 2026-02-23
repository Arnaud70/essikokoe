import { ApiProperty } from '@nestjs/swagger';

export class AuditStatusDto {
  @ApiProperty({ description: 'Nombre de transactions vérifiées', example: 5 })
  transactionsVerifiees: number;

  @ApiProperty({ description: 'Nombre d\'écarts détectés', example: 0 })
  ecartsDetectes: number;

  @ApiProperty({
    description: 'Statut de l\'audit',
    enum: ['Conforme', 'Non conforme', 'En cours de vérification'],
    example: 'Conforme',
  })
  statut: 'Conforme' | 'Non conforme' | 'En cours de vérification';

  @ApiProperty({
    description: 'Liste des écarts détectés',
    type: 'array',
    example: [],
  })
  detailsEcarts: {
    description: string;
    montant: number;
    dateDetection: Date;
  }[];
}

export class AuditEquilibrationDto {
  @ApiProperty({ description: 'Total des actifs (FCFA)', example: 2650000 })
  totalActifs: number;

  @ApiProperty({ description: 'Total des passifs (FCFA)', example: 2350000 })
  totalPassifs: number;

  @ApiProperty({
    description: 'Différence entre actifs et passifs (doit être 0)',
    example: 300000,
  })
  difference: number;

  @ApiProperty({ description: 'Bilan équilibré?', example: true })
  equilibre: boolean;
}

export class AuditTrendDto {
  @ApiProperty({
    description: 'Période analysée',
    example: '30 derniers jours',
  })
  periode: string;

  @ApiProperty({ description: 'Total des recettes (FCFA)', example: 50000 })
  totalRecettes: number;

  @ApiProperty({ description: 'Total des dépenses (FCFA)', example: 25000 })
  totalDepenses: number;

  @ApiProperty({ description: 'Résultat net (FCFA)', example: 25000 })
  resultatNet: number;

  @ApiProperty({ description: 'Taux de croissance (%)', example: 15.5 })
  tauxCroissance: number;

  @ApiProperty({
    description: 'Tendance détectée',
    enum: ['Hausse', 'Baisse', 'Stable'],
    example: 'Hausse',
  })
  tendance: 'Hausse' | 'Baisse' | 'Stable';
}
