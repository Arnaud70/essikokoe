import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.utilisateur.findUnique({ where: { idUtilisateur: id } });
  }

  async createUser(data: { nom: string; email: string; motDePasse: string; role?: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already registered');
    const saltRounds = 10;
    const hashed = await bcrypt.hash(data.motDePasse, saltRounds);
    const role = data.role || 'CLIENT';
    return this.prisma.utilisateur.create({
      data: {
        nom: data.nom,
        email: data.email,
        motDePasse: hashed,
        role: role as any,
      },
    });
  }
}
