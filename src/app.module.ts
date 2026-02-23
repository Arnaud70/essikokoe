import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { StockModule } from './modules/stock/stock.module';
import { ProduitsModule } from './modules/produits/produits.module';
import { VentesModule } from './modules/ventes/ventes.module';
import { ClientsModule } from './modules/clients/clients.module';
import { FacturesModule } from './modules/factures/factures.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
