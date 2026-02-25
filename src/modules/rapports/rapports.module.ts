import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RapportsService } from './services/rapports.service';
import { RapportsController } from './controllers/rapports.controller';

@Module({
  imports: [PrismaModule],
  providers: [RapportsService],
  controllers: [RapportsController],
  exports: [RapportsService],
})
export class RapportsModule {}
