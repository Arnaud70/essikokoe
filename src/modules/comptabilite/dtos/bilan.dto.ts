import { ApiProperty } from '@nestjs/swagger';

export class BilanResponseDto {
  @ApiProperty({ description: 'ID du bilan' })
  idBilan: string;

  @ApiProperty({ description: 'Exercice comptable' })
  exercice: string;

  @ApiProperty({ description: 'Actif immobilisé' })
  actifImmobilise: number;

  @ApiProperty({ description: 'Actif circulant' })
  actifCirculant: number;

  @ApiProperty({ description: 'Total actif' })
  totalActif: number;

  @ApiProperty({ description: 'Capitaux propres' })
  capitauxPropres: number;

  @ApiProperty({ description: 'Dettes' })
  dettes: number;

  @ApiProperty({ description: 'Total passif' })
  totalPassif: number;

  @ApiProperty({ description: 'Généré par' })
  generePar: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}
