import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user.response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create an internal user (admin only)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto, @Request() req: any) {
    // only admin via Roles guard can call this
    const created = await this.usersService.createUser({ nom: dto.nom, email: dto.email, motDePasse: dto.motDePasse, role: dto.role });
    // omit motDePasse in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { motDePasse, ...rest } = created as any;
    return rest;
  }
}
