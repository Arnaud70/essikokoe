import { Module } from '@nestjs/common';
import { RapportsController } from './controllers/rapports.controller';
import { RapportsService } from './services/rapports.service';
import { ProduitsModule } from '../produits/produits.module';
import { VentesModule } from '../ventes/ventes.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ProduitsModule, VentesModule, PrismaModule],
  controllers: [RapportsController],
  providers: [RapportsService],
  exports: [RapportsService],
})
export class RapportsModule {}
