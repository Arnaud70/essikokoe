import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RapportGlobalDto } from '../dtos/rapport-global.dto';
import { RapportVentesDto } from '../dtos/rapport-ventes.dto';
import { RapportProduitsDto } from '../dtos/rapport-produits.dto';
import { RapportClientsDto } from '../dtos/rapport-clients.dto';
import { RapportComptabiliteDto } from '../dtos/rapport-comptabilite.dto';

@Injectable()
export class RapportService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📊 GÉNÉRER LE RAPPORT GLOBAL
   */
  async generateRapportGlobal(): Promise<RapportGlobalDto> {
    const ventes = await this.getRapportVentes();
    const produits = await this.getRapportProduits();
    const clients = await this.getRapportClients();
    const comptabilite = await this.getRapportComptabilite();

    const indicateursCles = {
      chiffreAffaires: ventes.chiffreAffaires,
      soldeNet: comptabilite.soldeNet,
      nombreClients: clients.nombreClients,
      stockTotal: produits.stockTotal,
    };

    return {
      dateGeneration: new Date(),
      ventes,
      produits,
      clients,
      comptabilite,
      indicateursCles,
    };
  }

  /**
   * 📉 RAPPORT VENTES
   */
  private async getRapportVentes(): Promise<RapportVentesDto> {
    // Récupérer toutes les ventes avec les détails
    const ventes = await this.prisma.vente.findMany({
      include: {
        commande: {
          include: {
            client: true,
            lignes: {
              include: {
                produit: true,
              },
            },
          },
        },
      },
    });

    // Calcul du chiffre d'affaires
    const chiffreAffaires = ventes.reduce((acc, v) => acc + v.montantTotal, 0);
    const nombreVentes = ventes.length;
    const montantMoyenVente = nombreVentes > 0 ? chiffreAffaires / nombreVentes : 0;

    // Top produits les plus vendus
    const quantitesParProduit = new Map<string, { nom: string; quantite: number }>();
    ventes.forEach((v) => {
      v.commande?.lignes.forEach((ligne) => {
        const key = ligne.produitId;
        const current = quantitesParProduit.get(key) || { nom: ligne.produit.nomProduit, quantite: 0 };
        current.quantite += ligne.quantite;
        quantitesParProduit.set(key, current);
      });
    });

    const topProduits = Array.from(quantitesParProduit.entries())
      .map(([codeProduit, data]) => ({
        codeProduit,
        nomProduit: data.nom,
        quantiteVendue: data.quantite,
      }))
      .sort((a, b) => b.quantiteVendue - a.quantiteVendue)
      .slice(0, 5);

    // Top clients par montant
    const clientsMap = new Map<string, { nom: string; commandes: number; montant: number }>();
    ventes.forEach((v) => {
      const nomClient = v.commande?.client.nomClient || 'N/A';
      const idClient = v.commande?.client.idClient || 'unknown';
      const current = clientsMap.get(idClient) || { nom: nomClient, commandes: 0, montant: 0 };
      current.commandes += 1;
      current.montant += v.montantTotal;
      clientsMap.set(idClient, current);
    });

    const topClients = Array.from(clientsMap.values())
      .map((c) => ({
        nomClient: c.nom,
        nombreCommandes: c.commandes,
        montantTotal: c.montant,
      }))
      .sort((a, b) => b.montantTotal - a.montantTotal)
      .slice(0, 5);

    // Répartition par mode de paiement
    const repartitionPaiement: Record<string, number> = {};
    ventes.forEach((v) => {
      const mode = v.modePaiement || 'AUTRE';
      repartitionPaiement[mode] = (repartitionPaiement[mode] || 0) + v.montantTotal;
    });

    return {
      chiffreAffaires,
      nombreVentes,
      montantMoyenVente,
      topProduits,
      topClients,
      repartitionPaiement,
    };
  }

  /**
   * 📦 RAPPORT PRODUITS
   */
  private async getRapportProduits(): Promise<RapportProduitsDto> {
    const produits = await this.prisma.produit.findMany({
      include: {
        mouvements: true,
      },
    });

    const nombreProduits = produits.length;

    // Calcul du stock réel par produit
    const produitsDetailles = produits.map((p) => {
      const delta = p.mouvements.reduce((acc, m) => {
        if (m.type === 'ENTREE') return acc + m.quantite;
        if (m.type === 'SORTIE') return acc - m.quantite;
        return acc;
      }, 0);
      const stockActuel = (p.stockInitial || 0) + delta;
      return {
        codeProduit: p.codeProduit,
        nomProduit: p.nomProduit,
        format: p.format,
        stockActuel: Math.max(0, stockActuel),
        stockMinimum: p.stockMinimum || 0,
        prixUnitaire: p.prixUnitaire,
      };
    });

    // Statistiques
    const stockTotal = produitsDetailles.reduce((acc, p) => acc + p.stockActuel, 0);
    const nombreRuptures = produitsDetailles.filter((p) => p.stockActuel === 0).length;
    const stockFaible = produitsDetailles.filter(
      (p) => p.stockActuel > 0 && p.stockActuel <= p.stockMinimum,
    ).length;

    const produitEnRupture = produitsDetailles
      .filter((p) => p.stockActuel === 0)
      .map((p) => ({
        codeProduit: p.codeProduit,
        nomProduit: p.nomProduit,
        stockActuel: p.stockActuel,
      }))
      .slice(0, 5);

    const produitsStockFaible = produitsDetailles
      .filter((p) => p.stockActuel > 0 && p.stockActuel <= p.stockMinimum)
      .map((p) => ({
        codeProduit: p.codeProduit,
        nomProduit: p.nomProduit,
        stockActuel: p.stockActuel,
        stockMinimum: p.stockMinimum,
      }))
      .slice(0, 5);

    // Distribution par format
    const stockParFormat: Record<string, number> = {};
    produitsDetailles.forEach((p) => {
      const format = p.format || 'AUTRE';
      stockParFormat[format] = (stockParFormat[format] || 0) + p.stockActuel;
    });

    return {
      nombreProduits,
      stockTotal,
      nombreRuptures,
      stockFaible,
      produitEnRupture,
      produitsStockFaible,
      stockParFormat,
    };
  }

  /**
   * 👥 RAPPORT CLIENTS
   */
  async getRapportClients(): Promise<RapportClientsDto> {
    const clients = await this.prisma.client.findMany({
      include: {
        commandes: {
          include: {
            vente: true,
          },
        },
      },
    });

    const nombreClients = clients.length;

    // Nouveaux clients ce mois (30 derniers jours)
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);
    const nouveauxClients = clients.filter((c) => new Date(c.createdAt) > dateLimit).length;

    // Clients actifs (ayant acheté dernièrement - 60 jours)
    const dateLimit60 = new Date();
    dateLimit60.setDate(dateLimit60.getDate() - 60);
    const clientsActifs = clients.filter((c) => {
      const lastCommande = c.commandes.length > 0
        ? new Date(Math.max(...c.commandes.map((cmd) => new Date(cmd.dateCommande).getTime())))
        : null;
      return lastCommande && lastCommande > dateLimit60;
    }).length;

    const clientsInactifs = nombreClients - clientsActifs;

    // Montant moyen par client
    const totalVentes = await this.prisma.vente.aggregate({
      _sum: {
        montantTotal: true,
      },
    });
    const montantMoyenParClient = nombreClients > 0 ? (totalVentes._sum.montantTotal || 0) / nombreClients : 0;

    // Top clients
    const clientsWithMontant = clients.map((c) => {
      const montantTotal = c.commandes.reduce((acc, cmd) => {
        return acc + (cmd.vente?.montantTotal || 0);
      }, 0);
      return {
        idClient: c.idClient,
        nomClient: c.nomClient,
        nombreCommandes: c.commandes.length,
        montantTotal,
      };
    });

    const topClients = clientsWithMontant
      .sort((a, b) => b.montantTotal - a.montantTotal)
      .slice(0, 5)
      .map((c) => ({
        nomClient: c.nomClient,
        nombreCommandes: c.nombreCommandes,
        montantTotal: c.montantTotal,
      }));

    // Clients avec faible engagement
    const clientsEngagementFaible = clientsWithMontant
      .filter((c) => c.nombreCommandes < 3)
      .sort((a, b) => a.nombreCommandes - b.nombreCommandes)
      .slice(0, 5)
      .map((c) => {
        const client = clients.find((cl) => cl.idClient === c.idClient);
        return {
          telephone: client?.telephone || 'N/A',
          nomClient: c.nomClient,
          nombreCommandes: c.nombreCommandes,
        };
      });

    return {
      nombreClients,
      nouveauxClients,
      clientsActifs,
      clientsInactifs,
      montantMoyenParClient,
      topClients,
      clientsEngagementFaible,
    };
  }

  /**
   * 💰 RAPPORT COMPTABILITÉ
   */
  private async getRapportComptabilite(): Promise<RapportComptabiliteDto> {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculs basiques
    const totalRecettes = transactions
      .filter((t) => t.typeTransaction === 'RECETTE')
      .reduce((acc, t) => acc + t.montant, 0);

    const totalDepenses = transactions
      .filter((t) => t.typeTransaction === 'DEPENSE')
      .reduce((acc, t) => acc + t.montant, 0);

    const soldeNet = totalRecettes - totalDepenses;
    const nombreTransactions = transactions.length;

    // Répartition par type
    const repartitionTransactions: Record<string, number> = {};
    transactions.forEach((t) => {
      const type = t.typeTransaction;
      repartitionTransactions[type] = (repartitionTransactions[type] || 0) + 1;
    });

    // Dépenses par catégorie
    const depensesParCategorie: Record<string, number> = {};
    transactions
      .filter((t) => t.typeTransaction === 'DEPENSE')
      .forEach((t) => {
        const categorie = t.categorie || 'AUTRE';
        depensesParCategorie[categorie] = (depensesParCategorie[categorie] || 0) + t.montant;
      });

    // Recettes par catégorie
    const recettesParCategorie: Record<string, number> = {};
    transactions
      .filter((t) => t.typeTransaction === 'RECETTE')
      .forEach((t) => {
        const categorie = t.categorie || 'AUTRE';
        recettesParCategorie[categorie] = (recettesParCategorie[categorie] || 0) + t.montant;
      });

    // Dernières transactions
    const derniereTransactions = transactions
      .slice(0, 10)
      .map((t) => ({
        date: new Date(t.createdAt).toISOString().split('T')[0],
        typeTransaction: t.typeTransaction,
        montant: t.montant,
        description: t.description || 'N/A',
      }));

    return {
      totalRecettes,
      totalDepenses,
      soldeNet,
      nombreTransactions,
      repartitionTransactions,
      depensesParCategorie,
      recettesParCategorie,
      derniereTransactions,
    };
  }
}
