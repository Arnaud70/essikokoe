import { Module } from '@nestjs/common';
import { RapportsController } from './controllers/rapports.controller';
import { RapportsService } from './services/rapports.service';
import { ProduitsModule } from '../produits/produits.module';
import { VentesModule } from '../ventes/ventes.module';

@Module({
  imports: [ProduitsModule, VentesModule],
  controllers: [RapportsController],
  providers: [RapportsService],
})
export class RapportsModule {}
