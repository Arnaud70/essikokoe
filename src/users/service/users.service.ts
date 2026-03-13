import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.utilisateur.findUnique({ where: { idUtilisateur: id } });
  }

  async createUser(data: { nom: string; email: string; motDePasse: string; role?: string; magasinId?: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already registered');
    const saltRounds = 10;
    const hashed = await bcrypt.hash(data.motDePasse, saltRounds);
    const role = data.role || 'VENDEUR';
    return this.prisma.utilisateur.create({
      data: {
        nom: data.nom,
        email: data.email,
        motDePasse: hashed,
        role: role as any,
        magasinId: data.magasinId,
      },
    });
  }

  async getAllUsers(currentUser: any) {
    const where: any = {};
    if (currentUser.role !== 'SUPERADMIN') {
      where.magasinId = currentUser.magasinId;
    }

    return this.prisma.utilisateur.findMany({
      where,
      include: { magasin: true },
      orderBy: { nom: 'asc' },
    });
  }

  async updateUser(id: string, data: any, currentUser: any) {
    const userToUpdate = await this.findById(id);
    if (!userToUpdate) throw new NotFoundException('Utilisateur non trouvé');

    // Restrictions de sécurité
    if (currentUser.role !== 'SUPERADMIN') {
      if (userToUpdate.magasinId !== currentUser.magasinId) {
        throw new ForbiddenException('Vous ne pouvez modifier que les utilisateurs de votre magasin');
      }
      // Un gérant ne peut pas promouvoir quelqu'un en SUPERADMIN
      if (data.role === 'SUPERADMIN') {
        throw new ForbiddenException('Action non autorisée');
      }
    }

    const updateData: any = { ...data };
    if (data.motDePasse) {
      updateData.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }

    return this.prisma.utilisateur.update({
      where: { idUtilisateur: id },
      data: updateData,
    });
  }

  async deleteUser(id: string, currentUser: any) {
    const userToDelete = await this.findById(id);
    if (!userToDelete) throw new NotFoundException('Utilisateur non trouvé');

    if (currentUser.role !== 'SUPERADMIN') {
      if (userToDelete.magasinId !== currentUser.magasinId) {
        throw new ForbiddenException('Vous ne pouvez supprimer que les utilisateurs de votre magasin');
      }
      if (userToDelete.role === 'SUPERADMIN' || userToDelete.role === 'GERANT') {
        throw new ForbiddenException('Action non autorisée');
      }
    }

    return this.prisma.utilisateur.delete({
      where: { idUtilisateur: id },
    });
  }
}
