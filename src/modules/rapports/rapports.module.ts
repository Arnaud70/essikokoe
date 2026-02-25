import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RapportService } from './services/rapport.service';
import { RapportController } from './controllers/rapport.controller';
import { RapportClientsController } from './controllers/rapport-clients.controller';

@Module({
  imports: [PrismaModule],
  providers: [RapportService],
  controllers: [RapportController, RapportClientsController],
})
export class RapportModule {}
