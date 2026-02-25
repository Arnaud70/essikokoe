# TEST SCRIPT - Rapport Global (PowerShell) - ASCII only

# Configuration
$API_URL = "http://localhost:9000"
$EMAIL = "admin@example.com"
$PASSWORD = "password123"

Write-Host "=== Test du Systeme de Rapports Global ==="

function ExitWithError($message) {
    Write-Host $message
    exit 1
}

Write-Host "[1/2] Authentification..."
try {
    $authBody = @{ email = $EMAIL; password = $PASSWORD } | ConvertTo-Json
    $authResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body $authBody
    $ACCESS_TOKEN = $authResponse.access_token
    if (-not $ACCESS_TOKEN) { ExitWithError "Erreur: token manquant" }
    Write-Host "Token obtenu"
    Write-Host "Token preview: $($ACCESS_TOKEN.Substring(0, [math]::Min(50, $ACCESS_TOKEN.Length)))..."
} catch {
    ExitWithError "Erreur pendant l'authentification: $_"
}

Write-Host "[2/2] Recuperation du rapport global..."
try {
    $headers = @{ Authorization = "Bearer $ACCESS_TOKEN"; "Content-Type" = "application/json" }
    $rapport = Invoke-RestMethod -Uri "$API_URL/rapports/global" -Method Get -Headers $headers
    if (-not $rapport) { ExitWithError "Reponse vide" }
    Write-Host "Rapport obtenu"
} catch {
    ExitWithError "Erreur lors de la recuperation du rapport: $_"
}

Write-Host "=== Resume du rapport ==="
if ($rapport.indicateursCles) {
    $k = $rapport.indicateursCles
    Write-Host "Indicateurs cles: CA=$($k.chiffreAffaires), Solde=$($k.soldeNet), Clients=$($k.nombreClients), Stock=$($k.stockTotal)"
}

Write-Host "Ventes: CA=$($rapport.ventes.chiffreAffaires), NbVentes=$($rapport.ventes.nombreVentes)"
Write-Host "Produits: Nb=$($rapport.produits.nombreProduits), StockTotal=$($rapport.produits.stockTotal)"
Write-Host "Clients: Nb=$($rapport.clients.nombreClients), Nouveaux=$($rapport.clients.nouveauxClients)"
Write-Host "Comptabilite: Recettes=$($rapport.comptabilite.totalRecettes), Depenses=$($rapport.comptabilite.totalDepenses)"

if ($rapport.ventes.topProduits -and $rapport.ventes.topProduits.Count -gt 0) {
    Write-Host "Top produits:"
    foreach ($p in $rapport.ventes.topProduits) { Write-Host "  - $($p.codeProduit) $($p.nomProduit) x$($p.quantiteVendue)" }
}

if ($rapport.ventes.topClients -and $rapport.ventes.topClients.Count -gt 0) {
    Write-Host "Top clients:"
    foreach ($c in $rapport.ventes.topClients) { Write-Host "  - $($c.nomClient) : $($c.montantTotal)" }
}

# Sauvegarde
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = "rapport_$timestamp.json"
$rapport | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "Rapport sauvegarde dans: $outputFile"

Write-Host "Test complet: OK"
