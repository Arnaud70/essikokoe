import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({ description: 'ID de la transaction' })
  idTransaction: string;

  @ApiProperty({ enum: ['RECETTE', 'DEPENSE'] })
  typeTransaction: TransactionType;

  @ApiProperty({ description: 'Catégorie' })
  categorie: string;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Montant' })
  montant: number;

  @ApiProperty({ description: 'Référence', required: false })
  reference?: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}
