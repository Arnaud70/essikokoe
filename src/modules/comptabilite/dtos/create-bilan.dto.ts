import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBilanDto {
  @ApiProperty({ description: 'Exercice comptable (ex: 2025)', example: '2026' })
  @IsString()
  exercice: string;

  @ApiProperty({ description: 'Actif immobilisé (FCFA)', required: false, example: 1000000 })
  @IsNumber()
  @IsOptional()
  actifImmobilise?: number;

  @ApiProperty({ description: 'Actif circulant (FCFA)', required: false, example: 2500000 })
  @IsNumber()
  @IsOptional()
  actifCirculant?: number;

  @ApiProperty({ description: 'Total actif (FCFA)', required: false, example: 3500000 })
  @IsNumber()
  @IsOptional()
  totalActif?: number;

  @ApiProperty({ description: 'Capitaux propres (FCFA)', required: false, example: 2000000 })
  @IsNumber()
  @IsOptional()
  capitauxPropres?: number;

  @ApiProperty({ description: 'Dettes (FCFA)', required: false, example: 1000000 })
  @IsNumber()
  @IsOptional()
  dettes?: number;

  @ApiProperty({ description: 'Total passif (FCFA)', required: false, example: 3000000 })
  @IsNumber()
  @IsOptional()
  totalPassif?: number;

  @ApiProperty({ description: 'ID utilisateur ayant généré le bilan', example: 'admin@example.com' })
  @IsString()
  generePar: string;
}
