import { Module } from '@nestjs/common';
import { FacturesService } from './services/factures.service';
import { FacturesController } from './controllers/factures.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FacturesService],
  controllers: [FacturesController],
  exports: [FacturesService],
})
export class FacturesModule {}
