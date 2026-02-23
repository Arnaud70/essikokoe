import { ApiProperty } from '@nestjs/swagger';

export class AuditLogDto {
  @ApiProperty({
    description: 'ID du log audit',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  idAudit: string;

  @ApiProperty({
    description: 'Action effectuée',
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'],
    example: 'CREATE',
  })
  action: string;

  @ApiProperty({
    description: 'Entité affectée',
    example: 'Transaction',
  })
  entite: string;

  @ApiProperty({
    description: 'ID de l\'entité affectée',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  idEntite: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur ayant effectué l\'action',
    required: false,
    example: 'admin@example.com',
  })
  userId?: string;

  @ApiProperty({
    description: 'Anciennes valeurs (JSON)',
    required: false,
    example: { montant: 50000 },
  })
  ancienValeurs?: any;

  @ApiProperty({
    description: 'Nouvelles valeurs (JSON)',
    required: false,
    example: { montant: 60000 },
  })
  nouveauValeurs?: any;

  @ApiProperty({
    description: 'Date de l\'action',
    example: '2026-02-23T16:00:00Z',
  })
  createdAt: Date;
}
