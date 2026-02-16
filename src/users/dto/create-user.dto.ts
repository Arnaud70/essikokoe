import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Jean Dupont' })
  nom: string;

  @ApiProperty({ example: 'admin@esikokoe.tg' })
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  motDePasse: string;

  @ApiProperty({ example: 'CLIENT', required: false })
  role?: 'ADMIN' | 'AGENT' | 'CLIENT';
}
