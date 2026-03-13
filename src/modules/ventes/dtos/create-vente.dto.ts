import { IsString, IsArray, IsEnum, IsPositive, ValidateNested, IsPhoneNumber, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLigneVenteDto {
  @ApiProperty({
    description: 'Code du produit',
    example: 'PROD-001',
  })
  @IsString()
  codeProduit: string;

  @ApiProperty({
    description: 'Quantité vendue',
    example: 50,
    type: 'integer',
  })
  @IsPositive()
  quantite: number;

  @ApiProperty({
    description: 'Prix unitaire appliqué',
    example: 500.5,
    type: 'number',
  })
  @IsPositive()
  prixUnitaire: number;
}

export class CreateVenteDto {
  @ApiProperty({
    description: 'Nom du client (complet ou entreprise)',
    example: 'Restaurant Le Palmier',
  })
  @IsString()
  nomClient: string;

  @ApiProperty({
    description: 'Téléphone du client (format: +225 XX XX XX XX XX)',
    example: '+225 01 23 45 67 89',
  })
  @IsString()
  @Matches(/^\+225\s\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{2}$/, {
    message: 'Le téléphone doit être au format: +225 XX XX XX XX XX',
  })
  telephone: string;

  @ApiProperty({
    description: 'Adresse complète du client',
    example: 'Abidjan, Plateau, Rue de la Paix',
  })
  @IsString()
  adresse: string;

  @ApiProperty({
    description: 'Produits vendus',
    type: [CreateLigneVenteDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLigneVenteDto)
  produits: CreateLigneVenteDto[];

  @IsString()
  modePaiement: string;

  @ApiProperty({
    description: 'ID du magasin (pour Superadmin)',
    example: 'uuid-magasin',
    required: false,
  })
  @IsOptional()
  @IsString()
  magasinId?: string;
}
