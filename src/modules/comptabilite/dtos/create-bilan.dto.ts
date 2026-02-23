import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBilanDto {
  @ApiProperty({ description: 'Exercice comptable (ex: 2025)', example: '2025' })
  @IsString()
  exercice: string;

  @ApiProperty({ description: 'Actif immobilisé' })
  @IsNumber()
  @IsOptional()
  actifImmobilise?: number;

  @ApiProperty({ description: 'Actif circulant' })
  @IsNumber()
  @IsOptional()
  actifCirculant?: number;

  @ApiProperty({ description: 'Total actif' })
  @IsNumber()
  @IsOptional()
  totalActif?: number;

  @ApiProperty({ description: 'Capitaux propres' })
  @IsNumber()
  @IsOptional()
  capitauxPropres?: number;

  @ApiProperty({ description: 'Dettes' })
  @IsNumber()
  @IsOptional()
  dettes?: number;

  @ApiProperty({ description: 'Total passif' })
  @IsNumber()
  @IsOptional()
  totalPassif?: number;

  @ApiProperty({ description: 'Généré par (ID utilisateur)', example: 'user-123' })
  @IsString()
  generePar: string;
}
