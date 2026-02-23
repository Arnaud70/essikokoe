import { ApiProperty } from '@nestjs/swagger';
import { RapportType } from '@prisma/client';

export class RapportResponseDto {
  @ApiProperty({ description: 'ID du rapport' })
  idRapport: string;

  @ApiProperty({ enum: ['JOURNALIER', 'MENSUEL'] })
  typeRapport: RapportType;

  @ApiProperty({ description: 'Période' })
  periode: string;

  @ApiProperty({ description: 'Données statistiques' })
  donneesStatistiques: any;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}
