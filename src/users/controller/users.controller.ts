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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
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
  private cloudinaryService = new CloudinaryService();

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

  // ===== PROFILE & PREFERENCES =====

  @Get('profile')
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Mettre à jour son propre profil' })
  async updateProfile(@Request() req: any, @Body() dto: any) {
    // On ne permet pas de changer son rôle via cet endpoint
    const { role, magasinId, email, ...rest } = dto;
    return this.usersService.updateUser(req.user.sub, rest, req.user);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Mettre à jour ses préférences' })
  async updatePreferences(@Request() req: any, @Body() dto: any) {
    return this.usersService.updatePreferences(req.user.sub, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer son mot de passe' })
  async changePassword(@Request() req: any, @Body() dto: any) {
    return this.usersService.changePassword(req.user.sub, req.user, dto);
  }

  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new CloudinaryService().getStorage(),
    }),
  )
  @ApiOperation({ summary: 'Uploader une photo de profil' })
  async uploadPhoto(@Request() req: any, @UploadedFile() file: any) {
    const photoUrl = file.path; // Cloudinary returns the full URL in file.path
    await this.usersService.updateUser(req.user.sub, { photoUrl }, req.user);
    return { photoUrl };
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

  @Get('sessions')
  @ApiOperation({ summary: 'Lister ses sessions actives' })
  async getSessions(@Request() req: any) {
    return this.usersService.getSessions(req.user.sub);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Révoquer (déconnecter) une session' })
  async revokeSession(@Request() req: any, @Param('id') id: string) {
    return this.usersService.revokeSession(req.user.sub, id);
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
