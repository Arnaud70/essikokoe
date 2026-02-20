import { Module } from '@nestjs/common';
import { StockService } from './services/stock.service';
import { StockController } from './controllers/stock.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StockService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
