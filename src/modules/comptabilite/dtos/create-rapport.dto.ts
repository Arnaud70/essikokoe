import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RapportType } from '@prisma/client';

export class CreateRapportDto {
  @ApiProperty({ enum: ['JOURNALIER', 'MENSUEL'], example: 'JOURNALIER' })
  @IsEnum(RapportType)
  typeRapport: RapportType;

  @ApiProperty({ description: 'Période (ex: 2026-02-23 ou 2026-02)', example: '2026-02' })
  @IsString()
  periode: string;

  @ApiProperty({ description: 'Données statistiques en JSON' })
  donneesStatistiques: any;
}
