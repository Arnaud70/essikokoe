import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nom complet ou entreprise',
    example: 'Restaurant Le Palmier',
  })
  @IsString()
  nomClient: string;

  @ApiProperty({
    description: 'Téléphone du client',
    example: '+225 01 23 45 67 89',
  })
  @IsString()
  telephone: string;

  @ApiProperty({
    description: 'Adresse complète',
    example: 'Abidjan, Plateau, Rue de la Paix',
  })
  @IsString()
  adresse: string;
}

export class UpdateClientDto {
  @ApiProperty({
    description: 'Nom complet ou entreprise',
    example: 'Restaurant Le Palmier',
    required: false,
  })
  @IsString()
  @IsOptional()
  nomClient?: string;

  @ApiProperty({
    description: 'Téléphone du client',
    example: '+225 01 23 45 67 89',
    required: false,
  })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiProperty({
    description: 'Adresse complète',
    example: 'Abidjan, Plateau, Rue de la Paix',
    required: false,
  })
  @IsString()
  @IsOptional()
  adresse?: string;
}
