import { IsEnum, IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';
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

  @ApiProperty({ description: 'Référence externe (optionnel)', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ description: 'ID de la vente associée (optionnel)', required: false })
  @IsOptional()
  @IsString()
  venteId?: string;
}
