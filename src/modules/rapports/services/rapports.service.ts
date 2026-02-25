import { Injectable } from '@nestjs/common';
import { ProduitsService } from '../../produits/services/produits.service';
import { VentesService } from '../../ventes/services/ventes.service';

@Injectable()
export class RapportsService {
  constructor(
    private produitsService: ProduitsService,
    private ventesService: VentesService,
  ) {}

  async getProduitsRapport(dateDebut?: Date, dateFin?: Date) {
    // Récupérer toutes les ventes sur la période
    const ventes = dateDebut && dateFin
      ? (await this.ventesService.getVentesByDateRange(dateDebut, dateFin)).ventes
      : (await this.ventesService.getAllVentes()).ventes;

    // Récupérer les détails de chaque vente pour accéder aux produits
    const ventesDetails = await Promise.all(
      ventes.map((v) => this.ventesService.getVenteDetail(v.idVente))
    );

    // Calculer le classement des produits
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

    // Récupérer format des produits
    const allProduits = (await this.produitsService.getAllProduits()).produits;
    for (const code in produitsStats) {
      const prod = allProduits.find((p) => p.codeProduit === code);
      if (prod) produitsStats[code].format = prod.format;
    }

    // Classement par quantité et CA
    const classementSansPourcentage = Object.values(produitsStats)
      .sort((a, b) => b.quantite - a.quantite);

    // Chiffre d'affaires total
    const caTotal = classementSansPourcentage.reduce((sum, p) => sum + p.ca, 0);

    // Ajout du pourcentage CA dans le mapping final
    const classement = classementSansPourcentage.map((p) => ({
      nom: p.nom,
      quantite: p.quantite,
      ca: p.ca,
      format: p.format,
      pourcentageCA: caTotal > 0 ? parseFloat(((p.ca / caTotal) * 100).toFixed(1)) : 0,
    }));

    // Performance par catégorie
    const perfCategorie: Record<string, number> = {};
    classement.forEach((p) => {
      perfCategorie[p.format] = (perfCategorie[p.format] || 0) + p.ca;
    });
    const perfTotal = Object.values(perfCategorie).reduce((sum, v) => sum + v, 0);
    for (const k in perfCategorie) {
      perfCategorie[k] = perfTotal > 0 ? Math.round((perfCategorie[k] / perfTotal) * 100) : 0;
    }

    // Rotation des stocks (exemple simplifié)
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
}
