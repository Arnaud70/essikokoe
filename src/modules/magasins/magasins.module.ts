import { Module } from '@nestjs/common';
import { MagasinsService } from './services/magasins.service';
import { MagasinsController } from './controllers/magasins.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MagasinsController],
    providers: [MagasinsService],
    exports: [MagasinsService],
})
export class MagasinsModule { }
