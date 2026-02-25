import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SalesReportDto, MonthlySalesDto } from '../dtos/sales-metrics.dto';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère un rapport de ventes avec métriques et historique
   */
  async generateSalesReport(): Promise<SalesReportDto> {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Fonction helper pour créer une plage de dates
    const getMonthStart = (month: number, year: number) => {
      return new Date(year, month, 1);
    };

    const getMonthEnd = (month: number, year: number) => {
      return new Date(year, month + 1, 0, 23, 59, 59);
    };

    // Données du mois actuel
    const currentMonthStart = getMonthStart(currentMonth, currentYear);
    const currentMonthEnd = getMonthEnd(currentMonth, currentYear);

    const currentMonthVentes = await this.prisma.vente.findMany({
      where: {
        dateVente: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: {
        facture: true,
        commande: {
          include: {
            client: true,
          },
        },
      },
    });

    const currentMonthCA = currentMonthVentes.reduce(
      (sum, v) => sum + (v.montantTotal || 0),
      0,
    );
    const currentMonthCommandes = currentMonthVentes.length;
    const currentMonthPanierMoyen =
      currentMonthCommandes > 0
        ? Math.round(currentMonthCA / currentMonthCommandes)
        : 0;

    // Données du mois précédent
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear -= 1;
    }

    const previousMonthStart = getMonthStart(previousMonth, previousYear);
    const previousMonthEnd = getMonthEnd(previousMonth, previousYear);

    const previousMonthVentes = await this.prisma.vente.findMany({
      where: {
        dateVente: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      include: {
        facture: true,
        commande: {
          include: {
            client: true,
          },
        },
      },
    });

    const previousMonthCA = previousMonthVentes.reduce(
      (sum, v) => sum + (v.montantTotal || 0),
      0,
    );
    const previousMonthCommandes = previousMonthVentes.length;
    const previousMonthPanierMoyen =
      previousMonthCommandes > 0
        ? Math.round(previousMonthCA / previousMonthCommandes)
        : 0;

    // Calculs des variations
    const variationCA =
      previousMonthCA > 0
        ? parseFloat(
            (((currentMonthCA - previousMonthCA) / previousMonthCA) * 100).toFixed(1),
          )
        : 0;

    const variationCommandes =
      previousMonthCommandes > 0
        ? parseFloat(
            (
              ((currentMonthCommandes - previousMonthCommandes) /
                previousMonthCommandes) *
              100
            ).toFixed(1),
          )
        : 0;

    const variationPanierMoyen =
      previousMonthPanierMoyen > 0
        ? parseFloat(
            (
              ((currentMonthPanierMoyen - previousMonthPanierMoyen) /
                previousMonthPanierMoyen) *
              100
            ).toFixed(1),
          )
        : 0;

    // Récupérer les données des 3 derniers mois pour l'évolution
    const evolution: MonthlySalesDto[] = [];
    const monthsList = [
      { month: currentMonth, year: currentYear, isCurrent: true },
      { month: previousMonth, year: previousYear, isCurrent: false },
    ];

    // Ajouter le mois avant le précédent
    let twoMonthsAgoMonth = currentMonth - 2;
    let twoMonthsAgoYear = currentYear;
    if (twoMonthsAgoMonth < 0) {
      twoMonthsAgoMonth += 12;
      twoMonthsAgoYear -= 1;
    }
    monthsList.push({
      month: twoMonthsAgoMonth,
      year: twoMonthsAgoYear,
      isCurrent: false,
    });

    for (const monthData of monthsList) {
      const monthStart = getMonthStart(monthData.month, monthData.year);
      const monthEnd = getMonthEnd(monthData.month, monthData.year);

      const ventes = await this.prisma.vente.findMany({
        where: {
          dateVente: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          commande: {
            include: {
              client: true,
            },
          },
        },
      });

      const ca = ventes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
      const clients = new Set(
        ventes.map((v) => v.commande?.client?.idClient).filter(Boolean),
      ).size;

      const monthName = new Date(monthData.year, monthData.month, 1).toLocaleString(
        'fr-FR',
        { month: 'long', year: 'numeric' },
      );

      evolution.push({
        mois: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        chiffreAffaires: ca,
        nombreCommandes: ventes.length,
        nombreClients: clients,
        isCurrent: monthData.isCurrent,
      });
    }

    // Inverser l'ordre pour affichage (plus ancien au plus récent)
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
        objectifCroissance: 10, // Objectif défini
      },
      evolution,
      generatedAt: new Date(),
    };
  }
}
