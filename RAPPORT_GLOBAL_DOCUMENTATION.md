# 📊 Documentation - Système de Rapports Global

## Vue d'ensemble

Le système de rapports global agrège les données de **quatre modules** (Ventes, Produits, Clients, Comptabilité) en un seul rapport structuré. Cela fournit une vue complète et synthétisée de l'activité de l'entreprise.

---

## Architecture

### 📁 Structure des fichiers

```
src/modules/rapports/
├── controllers/
│   └── rapport.controller.ts       # Expose l'endpoint /rapports/global
├── services/
│   └── rapport.service.ts          # Agrège les données de tous les modules
├── dtos/
│   ├── rapport-global.dto.ts       # Schema du rapport complet
│   ├── rapport-ventes.dto.ts       # Schema rapport Ventes
│   ├── rapport-produits.dto.ts     # Schema rapport Produits
│   ├── rapport-clients.dto.ts      # Schema rapport Clients
│   └── rapport-comptabilite.dto.ts # Schema rapport Comptabilité
└── rapports.module.ts              # Module NestJS
```

### 🏗️ Composants

#### 1️⃣ **RapportService** (`rapport.service.ts`)

Service principal qui agrège les données. Il expose une méthode publique:

```typescript
async generateRapportGlobal(): Promise<RapportGlobalDto>
```

Et 4 méthodes privées:
- `getRapportVentes()` : Chiffre d'affaires, nombre de ventes, top produits/clients
- `getRapportProduits()` : Stock total, ruptures, produits en stock faible
- `getRapportClients()` : Nombre de clients, clients actifs, engagement
- `getRapportComptabilite()` : Recettes, dépenses, transactions

#### 2️⃣ **RapportController** (`rapport.controller.ts`)

Expose l'endpoint REST:

```typescript
GET /rapports/global
```

- **Authentification**: JWT Bearer Token requis
- **Réponse**: Objet `RapportGlobalDto` avec les 4 sections

#### 3️⃣ **DTOs** (Data Transfer Objects)

Structurent les données avec validation et documentation Swagger:

- `RapportGlobalDto` : Conteneur principal
- `RapportVentesDto` : Données de ventes
- `RapportProduitsDto` : Données de stock/produits
- `RapportClientsDto` : Données clients
- `RapportComptabiliteDto` : Données financières

---

## 📊 Structure du Rapport Global

### Endpoint: `GET /rapports/global`

**Réponse (JSON):**

```json
{
  "dateGeneration": "2026-02-25T14:30:00Z",
  "ventes": {
    "chiffreAffaires": 150000,
    "nombreVentes": 25,
    "montantMoyenVente": 6000,
    "topProduits": [
      {
        "codeProduit": "PROD-001",
        "nomProduit": "Eau Sachet",
        "quantiteVendue": 500
      }
    ],
    "topClients": [
      {
        "nomClient": "Client A",
        "nombreCommandes": 5,
        "montantTotal": 50000
      }
    ],
    "repartitionPaiement": {
      "ESPECES": 80000,
      "CHEQUE": 50000,
      "VIREMENT": 20000
    }
  },
  "produits": {
    "nombreProduits": 10,
    "stockTotal": 15280,
    "nombreRuptures": 3,
    "stockFaible": 2,
    "produitEnRupture": [
      {
        "codeProduit": "PROD-005",
        "nomProduit": "Eau 20L",
        "stockActuel": 0
      }
    ],
    "produitsStockFaible": [
      {
        "codeProduit": "PROD-002",
        "nomProduit": "Eau Carton",
        "stockActuel": 150,
        "stockMinimum": 200
      }
    ],
    "stockParFormat": {
      "SACHET": 5000,
      "CARTON": 4280,
      "BOUTEILLE": 3000,
      "VRAC": 3000
    }
  },
  "clients": {
    "nombreClients": 45,
    "nouveauxClients": 12,
    "clientsActifs": 35,
    "clientsInactifs": 10,
    "montantMoyenParClient": 3333.33,
    "topClients": [...],
    "clientsEngagementFaible": [...]
  },
  "comptabilite": {
    "totalRecettes": 150000,
    "totalDepenses": 45000,
    "soldeNet": 105000,
    "nombreTransactions": 25,
    "repartitionTransactions": {
      "RECETTE": 18,
      "DEPENSE": 7
    },
    "depensesParCategorie": {
      "SALAIRES": 20000,
      "TRANSPORT": 15000,
      "AMENAGEMENT": 10000
    },
    "recettesParCategorie": {
      "VENTES": 150000
    },
    "derniereTransactions": [...]
  },
  "indicateursCles": {
    "chiffreAffaires": 150000,
    "soldeNet": 105000,
    "nombreClients": 45,
    "stockTotal": 15280
  }
}
```

---

## 🔍 Détail par Module

### 1. **Rapport Ventes** (`RapportVentesDto`)

**Données calculées:**
- `chiffreAffaires`: Somme de tous les montants de ventes
- `nombreVentes`: Nombre total de ventes enregistrées
- `montantMoyenVente`: Chiffre d'affaires / Nombre de ventes
- `topProduits`: Top 5 produits triés par quantité vendue
- `topClients`: Top 5 clients triés par montant total dépensé
- `repartitionPaiement`: Agrégation des montants par mode (ESPECES, CHEQUE, VIREMENT)

### 2. **Rapport Produits** (`RapportProduitsDto`)

**Calculs du stock réel:**
- Pour chaque produit: `Stock Réel = stockInitial + ENTREES - SORTIES`

**Données calculées:**
- `nombreProduits`: Nombre total de produits
- `stockTotal`: Somme de tous les stocks réels
- `nombreRuptures`: Nombre de produits avec stock = 0
- `stockFaible`: Nombre de produits où `stockReel ≤ stockMinimum`
- `produitEnRupture`: Liste des produits en rupture (max 5)
- `produitsStockFaible`: Produits avec stock faible (max 5)
- `stockParFormat`: Distribution du stock par format

### 3. **Rapport Clients** (`RapportClientsDto`)

**Critères:**
- **Nouveaux clients**: Créés dans les 30 derniers jours
- **Clients actifs**: Ayant acheté dans les 60 derniers jours
- **Clients inactifs**: Autres clients

**Données calculées:**
- `nombreClients`: Total des clients
- `nouveauxClients`: Clients < 30 jours
- `clientsActifs`: Clients avec achat < 60 jours
- `clientsInactifs`: Nombre total - Clients actifs
- `montantMoyenParClient`: Total chiffre d'affaires / nombre de clients
- `topClients`: Top 5 clients par montant (max 5)
- `clientsEngagementFaible`: Clients avec < 3 commandes (max 5)

### 4. **Rapport Comptabilité** (`RapportComptabiliteDto`)

**Données calculées:**
- `totalRecettes`: Somme des transactions type=RECETTE
- `totalDepenses`: Somme des transactions type=DEPENSE
- `soldeNet`: totalRecettes - totalDepenses
- `nombreTransactions`: Total des transactions
- `repartitionTransactions`: Comptage par type (RECETTE, DEPENSE)
- `depensesParCategorie`: Agrégation par catégorie des dépenses
- `recettesParCategorie`: Agrégation par catégorie des recettes
- `derniereTransactions`: Dernières 10 transactions ordonnées par date

---

## 🚀 Utilisation

### Request cURL

```bash
curl -X GET http://localhost:3000/rapports/global \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Request HTTP Client (VS Code)

```http
GET http://localhost:3000/rapports/global
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response Status
- **200 OK**: Rapport généré avec succès
- **401 Unauthorized**: Token JWT manquant ou invalide
- **500 Internal Server Error**: Erreur serverà l'agrégation des données

---

## 💡 Cas d'usage

1. **Dashboard Executive**: Afficher les indicateurs clés en temps réel
2. **Rapports mensuels**: Générer des rapports pour la direction
3. **Monitoring**: Identifier les ruptures de stock et clients inactifs
4. **Business Intelligence**: Analyser les tendances et performances

---

## 🔧 Extension future

Pour ajouter d'autres rapports:

1. Créer un DTO spécifique: `rapport-[module].dto.ts`
2. Ajouter une méthode privée: `getReport[Module]()`
3. Créer un endpoint dédié dans le contrôleur
4. Documenter les nouvelles métriques

---

## 📝 Notes d'implémentation

- Tous les calculs sont **en temps réel** (pas de cache)
- Les dates utilisent les **derniers 30-60 jours** comme critères
- Le rapport inclut les **top 5** pour chaque catégorie
- Le format du rapport est **standardisé** avec Swagger
- L'endpoint est **sécurisé** par JWT
