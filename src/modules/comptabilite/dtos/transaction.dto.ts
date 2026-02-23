import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'ID de la transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  idTransaction: string;

  @ApiProperty({
    enum: ['RECETTE', 'DEPENSE'],
    example: 'RECETTE',
  })
  typeTransaction: TransactionType;

  @ApiProperty({
    description: 'Catégorie de la transaction',
    example: 'Ventes',
  })
  categorie: string;

  @ApiProperty({
    description: 'Description',
    required: false,
    example: 'Paiement client',
  })
  description?: string;

  @ApiProperty({
    description: 'Montant en FCFA',
    example: 50000,
  })
  montant: number;

  @ApiProperty({
    description: 'Référence externe',
    required: false,
    example: 'F-2026-001',
  })
  reference?: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-02-23T16:00:00Z',
  })
  createdAt: Date;
}
