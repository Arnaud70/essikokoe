import { Module } from '@nestjs/common';
import { ComptabiliteService } from './services/comptabilite.service';
import { ComptabiliteController } from './controllers/comptabilite.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ComptabiliteService],
  controllers: [ComptabiliteController],
  exports: [ComptabiliteService],
})
export class ComptabiliteModule {}