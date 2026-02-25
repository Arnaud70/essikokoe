import { ApiProperty } from '@nestjs/swagger';

export class RapportClientsDto {
  @ApiProperty({ example: 45, description: 'Nombre total de clients' })
  nombreClients: number;

  @ApiProperty({ 
    example: 12,
    description: 'Nombre de nouveaux clients ce mois'
  })
  nouveauxClients: number;

  @ApiProperty({
    example: 35,
    description: 'Nombre de clients actifs (ayant fait des achats récemment)'
  })
  clientsActifs: number;

  @ApiProperty({
    example: 10,
    description: 'Nombre de clients inactifs'
  })
  clientsInactifs: number;

  @ApiProperty({
    example: 3333.33,
    description: 'Montant moyen dépensé par client'
  })
  montantMoyenParClient: number;

  @ApiProperty({
    example: [
      { nomClient: 'SARL Alimentation', nombreCommandes: 15, montantTotal: 120000 },
      { nomClient: 'Restaurant XYZ', nombreCommandes: 10, montantTotal: 80000 },
      { nomClient: 'Épicerie du coin', nombreCommandes: 8, montantTotal: 60000 }
    ],
    description: 'Top 5 clients par montant d\'achats'
  })
  topClients: Array<{
    nomClient: string;
    nombreCommandes: number;
    montantTotal: number;
  }>;

  @ApiProperty({
    example: { telephone: '+223 XX XX XX XX', nomClient: 'Client Test', nombreCommandes: 0 },
    description: 'Clients avec faible engagement'
  })
  clientsEngagementFaible: Array<{
    telephone: string;
    nomClient: string;
    nombreCommandes: number;
  }>;
}
