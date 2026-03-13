import { IsString, IsInt, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDestockageDto {
    @ApiProperty({
        description: 'Code unique du produit',
        example: 'PROD-001',
    })
    @IsString()
    @IsNotEmpty()
    codeProduit: string;

    @ApiProperty({
        description: 'Quantité à déstocker (perte, casse, etc.)',
        example: 10,
        type: 'integer',
    })
    @IsInt()
    @IsPositive()
    quantite: number;

    @ApiProperty({
        description: 'Motif du déstockage (ex: Casse, Péremption)',
        example: 'Casse lors du transport',
    })
    @IsString()
    @IsNotEmpty()
    motif: string;
}
