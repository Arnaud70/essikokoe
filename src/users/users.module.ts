import { Module } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, { provide: APP_GUARD, useClass: RolesGuard }],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
