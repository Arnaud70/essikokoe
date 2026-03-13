import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Jean Dupont' })
  nom: string;

  @ApiProperty({ example: 'admin@esikokoe.tg' })
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  motDePasse: string;

  @ApiProperty({ example: 'VENDEUR', required: false })
  role?: 'SUPERADMIN' | 'GERANT' | 'MAGASINIER' | 'VENDEUR' | 'RESPONSABLE_ACHAT';

  @ApiProperty({ example: 'uuid-magasin-1', required: false })
  magasinId?: string;
}
