import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/service/users.service';
import { jwtConstants } from '../constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, 
    private jwtService: JwtService,
    private prisma: PrismaService
  ) { }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.motDePasse);
    if (match) {
      // omit password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { motDePasse, password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async login(user: any, metadata?: { userAgent?: string; ip?: string }) {
    if (!user) throw new UnauthorizedException();
    const payload = { sub: user.idUtilisateur, email: user.email, role: user.role, magasinId: user.magasinId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshPayload = { ...payload, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    // Créer une session dans la DB
    if (metadata) {
      await this.prisma.userSession.create({
        data: {
          utilisateurId: user.idUtilisateur,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ip,
          location: 'Lomé, Togo', // Simulation de localisation pour l'instant
          current: true, // On marquera les autres comme false plus tard ou on gérera côté front
        }
      });
    }

    return { accessToken, refreshToken };
  }

  async refresh(tokenPayload: any) {
    if (!tokenPayload.type || tokenPayload.type !== 'refresh') {
      throw new UnauthorizedException('Token is not a refresh token');
    }
    const payload = { sub: tokenPayload.sub, email: tokenPayload.email, role: tokenPayload.role, magasinId: tokenPayload.magasinId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    return { accessToken };
  }
}
