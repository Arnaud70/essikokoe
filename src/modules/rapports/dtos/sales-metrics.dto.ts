import { ApiProperty } from '@nestjs/swagger';

export class MonthlySalesDto {
  @ApiProperty({
    example: 'Janvier 2024',
    description: 'Mois et année',
  })
  mois: string;

  @ApiProperty({
    example: 2847500,
    description: 'Chiffre d\'affaires du mois en FCFA',
  })
  chiffreAffaires: number;

  @ApiProperty({
    example: 89,
    description: 'Nombre de commandes',
  })
  nombreCommandes: number;

  @ApiProperty({
    example: 234,
    description: 'Nombre de clients',
  })
  nombreClients: number;

  @ApiProperty({
    example: true,
    description: 'Indicateur si c\'est le mois actuel',
  })
  isCurrent: boolean;
}

export class SalesMetricsDto {
  @ApiProperty({
    example: 2847500,
    description: 'Chiffre d\'affaires du mois actuel en FCFA',
  })
  caduMois: number;

  @ApiProperty({
    example: 12.5,
    description: 'Variation en pourcentage par rapport au mois dernier',
  })
  variationCA: number;

  @ApiProperty({
    example: 89,
    description: 'Nombre de commandes du mois',
  })
  commandes: number;

  @ApiProperty({
    example: 8.1,
    description: 'Variation du nombre de commandes',
  })
  variationCommandes: number;

  @ApiProperty({
    example: 31989,
    description: 'Panier moyen en FCFA',
  })
  panierMoyen: number;

  @ApiProperty({
    example: 4.2,
    description: 'Variation du panier moyen',
  })
  variationPanierMoyen: number;

  @ApiProperty({
    example: 12.5,
    description: 'Taux de croissance en pourcentage',
  })
  tauxCroissance: number;

  @ApiProperty({
    example: 10,
    description: 'Objectif de croissance',
  })
  objectifCroissance: number;
}

export class SalesReportDto {
  @ApiProperty({
    type: SalesMetricsDto,
    description: 'Métriques principales du mois',
  })
  metrics: SalesMetricsDto;

  @ApiProperty({
    type: [MonthlySalesDto],
    description: 'Comparaison sur les 3 derniers mois',
  })
  evolution: MonthlySalesDto[];

  @ApiProperty({
    example: '2024-01-31T23:59:59.000Z',
    description: 'Date de génération du rapport',
  })
  generatedAt: Date;
}
