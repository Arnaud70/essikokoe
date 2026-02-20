[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZWY2YzUxMC05NDIxLTQyYTctYWRkOS1kZTQ2ZDVhMjJhYzQiLCJlbWFpbCI6ImFkbWluQGVzaWtva29lLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTU3NzU3NywiZXhwIjoxNzcxNTc4NDc3fQ.JgfEMQz2mJ0yesFycXapP_Udn5Q4Wed2xr7FaP_lOLs"

$body = @{
    codeProduit = "PROD-ESK-002"
    nomProduit = "Eau Purifiée Esikokoe"
    format = "SACHET"
    categorie = "Eaux Minérales"
    stockInitial = 1000
    stockMinimum = 100
    prixUnitaire = 2500
    fournisseur = "Esikokoe SA"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing POST /produits..." -ForegroundColor Cyan

$response = Invoke-WebRequest -Uri "http://localhost:9000/produits" -Method Post -Headers $headers -Body $body -UseBasicParsing
Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
$response.Content
