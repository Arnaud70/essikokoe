import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user.response.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Roles('SUPERADMIN', 'GERANT')
  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto, @Request() req: any) {
    const created = await this.usersService.createUser({
      nom: dto.nom,
      email: dto.email,
      motDePasse: dto.motDePasse,
      role: dto.role,
      magasinId: dto.magasinId,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { motDePasse, ...rest } = created as any;
    return rest;
  }

  @Roles('SUPERADMIN', 'GERANT')
  @Get()
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(@Request() req: any) {
    const users = await this.usersService.getAllUsers(req.user);
    return users.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { motDePasse, ...rest } = u as any;
      return rest;
    });
  }

  @Roles('SUPERADMIN', 'GERANT')
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    const updated = await this.usersService.updateUser(id, dto, req.user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { motDePasse, ...rest } = updated as any;
    return rest;
  }

  @Roles('SUPERADMIN', 'GERANT')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.usersService.deleteUser(id, req.user);
  }
}
