import { ApiProperty } from '@nestjs/swagger';

export class BilanResponseDto {
  @ApiProperty({
    description: 'ID du bilan',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  idBilan: string;

  @ApiProperty({
    description: 'Exercice comptable',
    example: '2026',
  })
  exercice: string;

  @ApiProperty({
    description: 'Actif immobilisé (FCFA)',
    example: 1000000,
  })
  actifImmobilise: number;

  @ApiProperty({
    description: 'Actif circulant (FCFA)',
    example: 2500000,
  })
  actifCirculant: number;

  @ApiProperty({
    description: 'Total actif (FCFA)',
    example: 3500000,
  })
  totalActif: number;

  @ApiProperty({
    description: 'Capitaux propres (FCFA)',
    example: 2000000,
  })
  capitauxPropres: number;

  @ApiProperty({
    description: 'Dettes (FCFA)',
    example: 1000000,
  })
  dettes: number;

  @ApiProperty({
    description: 'Total passif (FCFA)',
    example: 3000000,
  })
  totalPassif: number;

  @ApiProperty({
    description: 'Utilisateur qui a généré le bilan',
    example: 'admin@example.com',
  })
  generePar: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-02-23T16:00:00Z',
  })
  createdAt: Date;
}
