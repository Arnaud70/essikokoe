import { Injectable } from '@nestjs/common';
import { ProduitsService } from '../../produits/services/produits.service';
import { VentesService } from '../../ventes/services/ventes.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RapportsService {
  constructor(
    private produitsService: ProduitsService,
    private ventesService: VentesService,
    private prisma: PrismaService,
  ) { }

  async getProduitsRapport(user: any, dateDebut?: Date, dateFin?: Date) {
    const ventes = dateDebut && dateFin
      ? (await this.ventesService.getVentesByDateRange(dateDebut, dateFin, user)).ventes
      : (await this.ventesService.getAllVentes(user)).ventes;

    const ventesDetails = await Promise.all(
      ventes.map((v) => this.ventesService.getVenteDetail(v.idVente))
    );

    const produitsStats: Record<string, { nom: string; quantite: number; ca: number; format: string; pourcentageCA?: number }> = {};
    for (const vente of ventesDetails) {
      for (const prod of vente.produits || []) {
        if (!produitsStats[prod.codeProduit]) {
          produitsStats[prod.codeProduit] = {
            nom: prod.nomProduit,
            quantite: 0,
            ca: 0,
            format: '',
          };
        }
        produitsStats[prod.codeProduit].quantite += prod.quantite;
        produitsStats[prod.codeProduit].ca += prod.totalLigne;
      }
    }

    const allProduits = (await this.produitsService.getAllProduits(user)).produits || [];
    for (const code in produitsStats) {
      const prod = allProduits.find((p) => p.codeProduit === code);
      if (prod) produitsStats[code].format = prod.format;
    }

    const classementSansPourcentage = Object.values(produitsStats)
      .sort((a, b) => b.quantite - a.quantite);

    const caTotal = classementSansPourcentage.reduce((sum, p) => sum + p.ca, 0);

    const classement = classementSansPourcentage.map((p) => ({
      nom: p.nom,
      quantite: p.quantite,
      ca: p.ca,
      format: p.format,
      pourcentageCA: caTotal > 0 ? parseFloat(((p.ca / caTotal) * 100).toFixed(1)) : 0,
    }));

    const perfCategorie: Record<string, number> = {};
    classement.forEach((p) => {
      perfCategorie[p.format] = (perfCategorie[p.format] || 0) + p.ca;
    });
    const perfTotal = Object.values(perfCategorie).reduce((sum, v) => sum + v, 0);
    for (const k in perfCategorie) {
      perfCategorie[k] = perfTotal > 0 ? Math.round((perfCategorie[k] / perfTotal) * 100) : 0;
    }

    const rotationMoyenne = classement.length > 0 ? parseFloat((classement.reduce((sum, p) => sum + p.quantite, 0) / classement.length).toFixed(1)) : 0;
    const produitRapide = classement[0]?.nom || '';
    const stockDormant = classement.some((p) => p.quantite === 0);

    return {
      classement,
      performanceCategorie: perfCategorie,
      rotationStock: {
        moyenne: rotationMoyenne,
        produitRapide,
        stockDormant,
      },
    };
  }

  async generateSalesReport(user: any) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const getMonthStart = (month: number, year: number) => new Date(year, month, 1);
    const getMonthEnd = (month: number, year: number) => new Date(year, month + 1, 0, 23, 59, 59);

    const currentMonthStart = getMonthStart(currentMonth, currentYear);
    const currentMonthEnd = getMonthEnd(currentMonth, currentYear);

    const where: any = {
      dateVente: { gte: currentMonthStart, lte: currentMonthEnd },
    };
    if (user.role !== 'SUPERADMIN') where.magasinId = user.magasinId;

    const currentMonthVentes = await this.prisma.vente.findMany({
      where,
      include: {
        facture: true,
        client: true,
      },
    });

    const currentMonthCA = currentMonthVentes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
    const currentMonthCommandes = currentMonthVentes.length;
    const currentMonthPanierMoyen = currentMonthCommandes > 0 ? Math.round(currentMonthCA / currentMonthCommandes) : 0;

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear -= 1;
    }

    const previousMonthStart = getMonthStart(previousMonth, previousYear);
    const previousMonthEnd = getMonthEnd(previousMonth, previousYear);

    const prevWhere: any = {
      dateVente: { gte: previousMonthStart, lte: previousMonthEnd },
    };
    if (user.role !== 'SUPERADMIN') prevWhere.magasinId = user.magasinId;

    const previousMonthVentes = await this.prisma.vente.findMany({
      where: prevWhere,
      include: {
        facture: true,
        client: true,
      },
    });

    const previousMonthCA = previousMonthVentes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
    const previousMonthCommandes = previousMonthVentes.length;
    const previousMonthPanierMoyen = previousMonthCommandes > 0 ? Math.round(previousMonthCA / previousMonthCommandes) : 0;

    const variationCA = previousMonthCA > 0 ? parseFloat((((currentMonthCA - previousMonthCA) / previousMonthCA) * 100).toFixed(1)) : 0;
    const variationCommandes = previousMonthCommandes > 0 ? parseFloat((((currentMonthCommandes - previousMonthCommandes) / previousMonthCommandes) * 100).toFixed(1)) : 0;
    const variationPanierMoyen = previousMonthPanierMoyen > 0 ? parseFloat((((currentMonthPanierMoyen - previousMonthPanierMoyen) / previousMonthPanierMoyen) * 100).toFixed(1)) : 0;

    const evolution: any[] = [];
    const monthsList = [
      { month: currentMonth, year: currentYear, isCurrent: true },
      { month: previousMonth, year: previousYear, isCurrent: false },
    ];

    let twoMonthsAgoMonth = currentMonth - 2;
    let twoMonthsAgoYear = currentYear;
    if (twoMonthsAgoMonth < 0) {
      twoMonthsAgoMonth += 12;
      twoMonthsAgoYear -= 1;
    }
    monthsList.push({ month: twoMonthsAgoMonth, year: twoMonthsAgoYear, isCurrent: false });

    for (const monthData of monthsList) {
      const monthStart = getMonthStart(monthData.month, monthData.year);
      const monthEnd = getMonthEnd(monthData.month, monthData.year);

      const mWhere: any = {
        dateVente: { gte: monthStart, lte: monthEnd },
      };
      if (user.role !== 'SUPERADMIN') mWhere.magasinId = user.magasinId;

      const vts = await this.prisma.vente.findMany({
        where: mWhere,
        include: { client: true },
      });

      const ca = vts.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
      const cls = new Set(vts.map((v) => v.client?.idClient).filter(Boolean)).size;
      const monthName = new Date(monthData.year, monthData.month, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

      evolution.push({
        mois: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        chiffreAffaires: ca,
        nombreCommandes: vts.length,
        nombreClients: cls,
        isCurrent: monthData.isCurrent,
      });
    }

    evolution.reverse();

    return {
      metrics: {
        caduMois: currentMonthCA,
        variationCA,
        commandes: currentMonthCommandes,
        variationCommandes,
        panierMoyen: currentMonthPanierMoyen,
        variationPanierMoyen,
        tauxCroissance: variationCA,
        objectifCroissance: 10,
      },
      evolution,
      generatedAt: new Date(),
    };
  }
}
