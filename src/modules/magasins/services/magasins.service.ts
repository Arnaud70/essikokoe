import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMagasinDto, UpdateMagasinDto } from '../dtos/magasin.dto';

@Injectable()
export class MagasinsService {
    constructor(private prisma: PrismaService) { }

    async createMagasin(dto: CreateMagasinDto) {
        return this.prisma.magasin.create({
            data: {
                nom: dto.nom,
                adresse: dto.adresse || '',
            },
        });
    }

    async getAllMagasins() {
        return this.prisma.magasin.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getMagasinById(idMagasin: string) {
        const magasin = await this.prisma.magasin.findUnique({
            where: { idMagasin },
        });

        if (!magasin) {
            throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
        }

        return magasin;
    }

    async updateMagasin(idMagasin: string, dto: UpdateMagasinDto) {
        const magasin = await this.getMagasinById(idMagasin);

        return this.prisma.magasin.update({
            where: { idMagasin },
            data: dto,
        });
    }

    async deleteMagasin(idMagasin: string) {
        const magasin = await this.getMagasinById(idMagasin);

        // Vérifier s'il y a des utilisateurs ou des produits liés
        const usersCount = await this.prisma.utilisateur.count({
            where: { magasinId: idMagasin },
        });

        const productsCount = await this.prisma.stock.count({
            where: { magasinId: idMagasin },
        });

        if (usersCount > 0 || productsCount > 0) {
            throw new ConflictException(
                `Impossible de supprimer le magasin : il contient ${usersCount} utilisateur(s) et ${productsCount} produit(s) en stock.`,
            );
        }

        return this.prisma.magasin.delete({
            where: { idMagasin },
        });
    }
}
