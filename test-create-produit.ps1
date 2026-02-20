[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZWY2YzUxMC05NDIxLTQyYTctYWRkOS1kZTQ2ZDVhMjJhYzQiLCJlbWFpbCI6ImFkbWluQGVzaWtva29lLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTU3NzI0MywiZXhwIjoxNzcxNTc4MTQzfQ.peYhSzfdSYW3qqpw-E3ivwDvy9E5unxHeixGbYj6YkA"

$body = @{
    codeProduit = "PROD-$(Get-Random)"
    nomProduit = "Eau Purifiée Esikokoe"
    format = "SACHET"
    categorie = "Eaux Minérales"
    stockInitial = 500
    stockMinimum = 50
    prixUnitaire = 2500
    fournisseur = "Esikokoe SA"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing POST /produits..."
Write-Host "Token: $($token.Substring(0, 50))..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/produits" -Method Post -Headers $headers -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | Format-List
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
