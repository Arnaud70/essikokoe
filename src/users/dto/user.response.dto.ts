import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  idUtilisateur: string;

  @ApiProperty({ example: 'Jean Dupont' })
  nom: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'CLIENT' })
  role: string;

  @ApiProperty({ example: '2026-02-16T12:00:00.000Z' })
  createdAt: string;
}
