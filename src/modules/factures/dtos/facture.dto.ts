import { IsString, IsOptional, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FactureDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idFacture: string;

  @ApiProperty({ example: 'F-2024-089' })
  numeroFacture: string;

  @ApiProperty({ example: '2024-01-15T14:30:00Z' })
  dateFacture: Date;

  @ApiProperty({ example: 11800 })
  montant: number;

  @ApiProperty({ example: 'Restaurant Le Palmier' })
  client: string;

  @ApiProperty({ example: 'Payée', enum: ['Payée', 'En attente', 'Annulée'] })
  statut: string;
}

export class CreateFactureDto {
  @ApiProperty({
    description: 'ID de la vente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  venteId: string;

  @ApiProperty({
    description: 'Montant de la facture',
    example: 11800,
  })
  @IsNumber()
  @IsPositive()
  montant: number;

  @ApiProperty({
    description: 'Statut de la facture',
    enum: ['Payée', 'En attente', 'Annulée'],
    example: 'Payée',
    required: false,
  })
  @IsString()
  @IsOptional()
  statut?: string;
}

export class UpdateFactureDto {
  @ApiProperty({
    description: 'Statut de la facture',
    enum: ['Payée', 'En attente', 'Annulée'],
    example: 'Payée',
    required: false,
  })
  @IsString()
  @IsOptional()
  statut?: string;

  @ApiProperty({
    description: 'Montant de la facture',
    example: 11800,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  montant?: number;
}

export class FactureListResponseDto {
  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({
    type: [FactureDto],
  })
  factures: FactureDto[];
}
