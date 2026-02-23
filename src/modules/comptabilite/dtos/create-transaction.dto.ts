import { IsEnum, IsString, IsOptional, IsNumber, IsPositive, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['RECETTE', 'DEPENSE'], example: 'RECETTE' })
  @IsEnum(TransactionType)
  typeTransaction: TransactionType;

  @ApiProperty({ description: 'Catégorie de la transaction', example: 'Vente' })
  @IsString()
  categorie: string;

  @ApiProperty({ description: 'Description', example: 'Paiement client', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Montant en FCFA', example: 1200 })
  @IsNumber()
  @IsPositive()
  montant: number;

  @ApiProperty({ description: 'Référence externe (optionnel)', required: false, example: 'F-2024-001' })
  @IsOptional()
  @Matches(/^[A-Z]+-\d{4}-\d{3,4}$/, { message: 'Format invalide. Exemples valides: F-2024-001, BON-2024-012' })
  reference?: string;

  @ApiProperty({ description: 'ID de la vente associée (optionnel)', required: false, example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  venteId?: string;
}
