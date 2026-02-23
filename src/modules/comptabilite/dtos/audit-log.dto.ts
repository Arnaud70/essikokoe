import { ApiProperty } from '@nestjs/swagger';

export class AuditLogDto {
  @ApiProperty({ description: 'ID du log' })
  id: string;

  @ApiProperty({ description: 'Action effectuée', example: 'CREATE_TRANSACTION' })
  action: string;

  @ApiProperty({ description: 'Utilisateur', example: 'admin@example.com' })
  user?: string;

  @ApiProperty({ description: 'Détails en JSON' })
  details?: any;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}
