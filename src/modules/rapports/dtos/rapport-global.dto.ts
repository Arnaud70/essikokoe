import { ApiProperty } from '@nestjs/swagger';
import { RapportVentesDto } from './rapport-ventes.dto';
import { RapportProduitsDto } from './rapport-produits.dto';
import { RapportClientsDto } from './rapport-clients.dto';
import { RapportComptabiliteDto } from './rapport-comptabilite.dto';

export class RapportGlobalDto {
  @ApiProperty({ 
    example: '2026-02-25T10:30:00Z',
    description: 'Date et heure de génération du rapport'
  })
  dateGeneration: Date;

  @ApiProperty({
    type: RapportVentesDto,
    description: 'Section Ventes'
  })
  ventes: RapportVentesDto;

  @ApiProperty({
    type: RapportProduitsDto,
    description: 'Section Produits / Stock'
  })
  produits: RapportProduitsDto;

  @ApiProperty({
    type: RapportClientsDto,
    description: 'Section Clients'
  })
  clients: RapportClientsDto;

  @ApiProperty({
    type: RapportComptabiliteDto,
    description: 'Section Comptabilité / Financier'
  })
  comptabilite: RapportComptabiliteDto;

  @ApiProperty({
    example: {
      chiffreAffaires: 150000,
      soldeNet: 105000,
      nombreClients: 45,
      stockTotal: 15280
    },
    description: 'Résumé des indicateurs clés'
  })
  indicateursCles: {
    chiffreAffaires: number;
    soldeNet: number;
    nombreClients: number;
    stockTotal: number;
  };
}
