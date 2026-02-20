import { Module } from '@nestjs/common';
import { ProduitsService } from './services/produits.service';
import { ProduitsController } from './controllers/produits.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProduitsService],
  controllers: [ProduitsController],
  exports: [ProduitsService],
})
export class ProduitsModule {}
