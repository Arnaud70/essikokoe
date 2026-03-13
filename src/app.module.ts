import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { StockModule } from './modules/stock/stock.module';
import { ProduitsModule } from './modules/produits/produits.module';
import { VentesModule } from './modules/ventes/ventes.module';
import { ClientsModule } from './modules/clients/clients.module';
import { FacturesModule } from './modules/factures/factures.module';
import { ComptabiliteModule } from './modules/comptabilite/comptabilite.module';
import { RapportsModule } from './modules/rapports/rapports.module';
import { MagasinsModule } from './modules/magasins/magasins.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    StockModule,
    ProduitsModule,
    VentesModule,
    ClientsModule,
    FacturesModule,
    ComptabiliteModule,
    RapportsModule,
    MagasinsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
