import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVenteDto {
  @ApiPropertyOptional({ description: 'Nom du client' })
  @IsOptional()
  @IsString()
  nomClient?: string;

  @ApiPropertyOptional({ description: 'Téléphone du client' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Adresse du client' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ description: 'Mode de paiement' })
  @IsOptional()
  @IsString()
  modePaiement?: string;

  @ApiPropertyOptional({ description: 'Statut de la commande (EN_ATTENTE|VALIDEE|LIVREE)' })
  @IsOptional()
  @IsString()
  statut?: string;
}
