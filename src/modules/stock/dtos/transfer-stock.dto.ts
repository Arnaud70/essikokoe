import { IsString, IsInt, IsPositive, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferStockDto {
    @ApiProperty({
        description: 'Code unique du produit à transférer',
        example: 'PROD-001',
    })
    @IsString()
    @IsNotEmpty()
    codeProduit: string;

    @ApiProperty({
        description: 'Quantité à transférer',
        example: 100,
        type: 'integer',
    })
    @IsInt()
    @IsPositive()
    quantite: number;

    @ApiProperty({
        description: 'ID du magasin source (facultatif si transfert depuis le stock central)',
        example: 'uuid-magasin-source',
        required: false,
    })
    @IsUUID()
    @IsOptional()
    sourceMagasinId?: string;

    @ApiProperty({
        description: 'ID du magasin de destination',
        example: 'uuid-magasin-dest',
    })
    @IsUUID()
    @IsNotEmpty()
    destinationMagasinId: string;

    @ApiProperty({
        description: 'Motif du transfert/distribution',
        example: 'Approvisionnement hebdomadaire',
        required: false,
    })
    @IsString()
    @IsOptional()
    motif?: string;
}
