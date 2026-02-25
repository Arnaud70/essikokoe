#!/bin/bash

# 🧪 SCRIPTS DE TEST - Rapport Global
# ===================================

# Configuration
API_URL="http://localhost:3000"
EMAIL="admin@example.com"
PASSWORD="password123"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Test du Système de Rapports Global ===${NC}\n"

# ============================================
# ÉTAPE 1: Authentification
# ============================================
echo -e "${YELLOW}[1/2] Authentification...${NC}"

AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"motDePasse\": \"$PASSWORD\"
  }")

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Erreur lors de l'authentification${NC}"
  echo "Réponse: $AUTH_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Token obtenu${NC}"
echo "Token: ${ACCESS_TOKEN:0:50}...\n"

# ============================================
# ÉTAPE 2: Récupérer le rapport global
# ============================================
echo -e "${YELLOW}[2/2] Récupération du rapport global...${NC}"

RAPPORT=$(curl -s -X GET "$API_URL/rapports/global" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

if echo "$RAPPORT" | grep -q "error"; then
  echo -e "${RED}❌ Erreur lors de la récupération du rapport${NC}"
  echo "Réponse: $RAPPORT"
  exit 1
fi

echo -e "${GREEN}✓ Rapport obtenu avec succès${NC}\n"

# ============================================
# ÉTAPE 3: Affichage du résumé
# ============================================
echo -e "${BLUE}=== RÉSUMÉ DU RAPPORT ===${NC}\n"

# Utiliser jq pour extraire les informations (si disponible)
if command -v jq &> /dev/null; then
  echo -e "${YELLOW}📊 INDICATEURS CLÉS:${NC}"
  echo "$RAPPORT" | jq '.indicateursCles' | sed 's/^/  /'
  
  echo -e "\n${YELLOW}💰 VENTES:${NC}"
  echo "$RAPPORT" | jq '{
    chiffreAffaires: .ventes.chiffreAffaires,
    nombreVentes: .ventes.nombreVentes,
    montantMoyenVente: .ventes.montantMoyenVente,
    topProduits: .ventes.topProduits | length,
    topClients: .ventes.topClients | length
  }' | sed 's/^/  /'
  
  echo -e "\n${YELLOW}📦 PRODUITS:${NC}"
  echo "$RAPPORT" | jq '{
    nombreProduits: .produits.nombreProduits,
    stockTotal: .produits.stockTotal,
    nombreRuptures: .produits.nombreRuptures,
    stockFaible: .produits.stockFaible
  }' | sed 's/^/  /'
  
  echo -e "\n${YELLOW}👥 CLIENTS:${NC}"
  echo "$RAPPORT" | jq '{
    nombreClients: .clients.nombreClients,
    nouveauxClients: .clients.nouveauxClients,
    clientsActifs: .clients.clientsActifs,
    clientsInactifs: .clients.clientsInactifs,
    montantMoyenParClient: .clients.montantMoyenParClient
  }' | sed 's/^/  /'
  
  echo -e "\n${YELLOW}💼 COMPTABILITÉ:${NC}"
  echo "$RAPPORT" | jq '{
    totalRecettes: .comptabilite.totalRecettes,
    totalDepenses: .comptabilite.totalDepenses,
    soldeNet: .comptabilite.soldeNet,
    nombreTransactions: .comptabilite.nombreTransactions
  }' | sed 's/^/  /'
  
  echo -e "\n${YELLOW}🔝 TOP PRODUITS:${NC}"
  echo "$RAPPORT" | jq '.ventes.topProduits[]' | sed 's/^/  /'
  
  echo -e "\n${YELLOW}⭐ TOP CLIENTS:${NC}"
  echo "$RAPPORT" | jq '.ventes.topClients[]' | sed 's/^/  /'
  
else
  # Fallback si jq n'est pas installé
  echo "Réponse complète:"
  echo "$RAPPORT"
fi

# ============================================
# ÉTAPE 4: Sauvegarde du rapport
# ============================================
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="rapport_$TIMESTAMP.json"

echo "$RAPPORT" > "$OUTPUT_FILE"
echo -e "\n${GREEN}✓ Rapport sauvegardé dans: $OUTPUT_FILE${NC}\n"

echo -e "${GREEN}=== Test complet réussi! ===${NC}"
