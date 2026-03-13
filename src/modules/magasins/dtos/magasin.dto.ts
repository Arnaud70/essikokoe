import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMagasinDto {
    @ApiProperty({ example: 'Magasin Central' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ example: '123 Rue de la Paix, Lomé' })
    @IsString()
    @IsNotEmpty()
    adresse: string;
}

export class UpdateMagasinDto extends PartialType(CreateMagasinDto) { }

export class MagasinResponseDto {
    @ApiProperty()
    idMagasin: string;

    @ApiProperty()
    nom: string;

    @ApiProperty()
    adresse: string;

    @ApiProperty()
    createdAt: Date;
}
