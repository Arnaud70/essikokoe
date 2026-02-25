# 🧪 Guide de Test - Rapport Global

## 1. Prérequis

- Le serveur NestJS doit être en cours d'exécution
- Vous devez avoir un token JWT valide (obnu via`)
- Postman ou curl installé

---

## 2. Récupérer un Token JWT

### Via `/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "motDePasse": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copien la valeur de `access_token`.

---

## 3. Tester l'Endpoint `/rapports/global`

### 3.1 Avec cURL

```bash
curl -X GET http://localhost:3000/rapports/global \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3.2 Avec Postman

**Étapes:**

1. Nouvelle requête → **GET**
2. URL: `http://localhost:3000/rapports/global`
3. Onglet **Headers**:
   - `Authorization`: `Bearer YOUR_TOKEN_HERE`
4. Cliquer **Send**

### 3.3 Exemple complet (All-in-one)

```bash
#!/bin/bash

# 1. Récupérer le token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "motDePasse": "password123"
  }')

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

echo "Token obtenu: $ACCESS_TOKEN"

# 2. Appeler le rapport avec le token
curl -X GET http://localhost:3000/rapports/global \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | jq .
```

---

## 4. Exemple de Réponse

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
        "nomClient": "Alimentation XYZ",
        "nombreCommandes": 5,
        "montantTotal": 50000
      }
    ],
    "repartitionPaiement": {
      "ESPECES": 80000,
      "CHEQUE": 50000
    }
  },
  "produits": {
    "nombreProduits": 10,
    "stockTotal": 15280,
    "nombreRuptures": 3,
    "stockFaible": 2,
    "produitEnRupture": [],
    "produitsStockFaible": [],
    "stockParFormat": {
      "SACHET": 5000,
      "CARTON": 4280
    }
  },
  "clients": {
    "nombreClients": 45,
    "nouveauxClients": 12,
    "clientsActifs": 35,
    "clientsInactifs": 10,
    "montantMoyenParClient": 3333.33,
    "topClients": [],
    "clientsEngagementFaible": []
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
      "SALAIRES": 20000
    },
    "recettesParCategorie": {
      "VENTES": 150000
    },
    "derniereTransactions": []
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

## 5. Validation des Champs

| Champ | Type | Description |
|-------|------|-------------|
| `dateGeneration` | Date | Timestamp UTC de génération |
| `ventes.chiffreAffaires` | Number | Total des ventes en F CFA |
| `ventes.nombreVentes` | Number | Nombre de transactions |
| `ventes.topProduits[].quantiteVendue` | Number | Unités vendues |
| `produits.stockTotal` | Number | Somme stocks réels |
| `produits.nombreRuptures` | Number | Produits avec stock=0 |
| `clients.nombreClients` | Number | Clients uniques |
| `clients.clientsActifs` | Number | Clients achat < 60j |
| `comptabilite.soldeNet` | Number | Recettes - Dépenses |
| `indicateursCles.*` | Number | KPIs résumés |

---

## 6. Codes d'Erreur

| Code | Message | Cause |
|------|---------|-------|
| `200` | OK | Rapport généré avec succès |
| `401` | Unauthorized | Token manquant ou expiré |
| `403` | Forbidden | Utilisateur sans permissions |
| `500` | Internal Server Error | Erreur lors du calcul des données |

---

## 7. Dépannage

### "Token invalide"
```bash
# Vérifier le format du token
curl -X GET http://localhost:3000/rapports/global \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v  # Verbose pour voir les headers
```

### "Pas de données"
- Vérifier que des données existent dans les tables (ventes, clients, etc.)
- Consulter les logs du serveur

### "Erreur 500"
- Vérifier la connexion à la base de données Prisma
- Consulter les logs pour les détails d'erreur

---

## 8. Collection Postman (JSON Import)

Créer un fichier `postman_collection.json` et importer:

```json
{
  "info": {
    "name": "Eau Esikokoé API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@example.com\",\n  \"motDePasse\": \"password123\"\n}"
        },
        "url": {"raw": "http://localhost:3000/auth/login", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["auth", "login"]}
      }
    },
    {
      "name": "Rapports - Global",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
        "url": {"raw": "http://localhost:3000/rapports/global", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["rapports", "global"]}
      }
    }
  ]
}
```

---

## 9. Performance

- **Temps de réponse expectedu**: 500ms - 2s (dépend du volume de données)
- **Pas de pagination**: Le rapport complet est toujours retourné
- **Cache**: À implémenter pour les gros volumes

---

## 10. Swagger Documentation

Accédez à la documentation interactive:

```
http://localhost:3000/api
```

Cherchez "Rapports" dans la section "Controllers"
