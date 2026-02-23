import { Module } from '@nestjs/common';
import { VentesService } from './services/ventes.service';
import { VentesController } from './controllers/ventes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VentesService],
  controllers: [VentesController],
  exports: [VentesService],
})
export class VentesModule {}
