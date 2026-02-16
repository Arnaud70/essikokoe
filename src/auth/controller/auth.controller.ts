import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../../users/service/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from '../dto/login.response.dto';
import { UserResponseDto } from '../../users/dto/user.response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user and receive access + refresh tokens' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) return { error: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new client (role CLIENT)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async register(@Body() dto: CreateUserDto) {
    // public registration: create a Utilisateur with role CLIENT by default
    const created = await this.usersService.createUser({ nom: dto.nom, email: dto.email, motDePasse: dto.motDePasse, role: 'CLIENT' });
    // omit motDePasse in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { motDePasse, ...rest } = created as any;
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: any) {
    // expects a valid refresh token in Authorization header
    return this.authService.refresh(req.user);
  }
}
