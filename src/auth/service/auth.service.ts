import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/service/users.service';
import { jwtConstants } from '../constants';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

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

  async login(user: any) {
    if (!user) throw new UnauthorizedException();
    const payload = { sub: user.idUtilisateur, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async refresh(tokenPayload: any) {
    // tokenPayload should already be validated by strategy/guard
    const payload = { sub: tokenPayload.sub, email: tokenPayload.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    return { accessToken };
  }
}
