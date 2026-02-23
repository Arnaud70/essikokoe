import { ApiProperty } from '@nestjs/swagger';
import { RapportType } from '@prisma/client';

export class RapportResponseDto {
  @ApiProperty({
    description: 'ID du rapport',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  idRapport: string;

  @ApiProperty({
    enum: ['JOURNALIER', 'MENSUEL'],
    example: 'JOURNALIER',
  })
  typeRapport: RapportType;

  @ApiProperty({
    description: 'Période du rapport',
    example: '2026-02-23',
  })
  periode: string;

  @ApiProperty({
    description: 'Données statistiques en JSON',
    example: { totalRecettes: 50000, totalDepenses: 25000 },
  })
  donneesStatistiques: any;

  @ApiProperty({
    description: 'Date de création du rapport',
    example: '2026-02-23T16:00:00Z',
  })
  createdAt: Date;
}
