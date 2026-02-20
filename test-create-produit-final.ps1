[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZWY2YzUxMC05NDIxLTQyYTctYWRkOS1kZTQ2ZDVhMjJhYzQiLCJlbWFpbCI6ImFkbWluQGVzaWtva29lLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTU3NzU3NywiZXhwIjoxNzcxNTc4NDc3fQ.JgfEMQz2mJ0yesFycXapP_Udn5Q4Wed2xr7FaP_lOLs"

$body = @{
    codeProduit = "PROD-ESK-001"
    nomProduit = "Eau Purifiée Esikokoe Premium"
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

Write-Host "📦 Creating product with ADMIN token..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/produits" -Method Post -Headers $headers -Body $body -UseBasicParsing
    Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    $product = $response.Content | ConvertFrom-Json
    $product | Format-List
    Write-Host ""
    Write-Host "📋 Created Product:" -ForegroundColor Cyan  
    Write-Host "  Code: $($product.codeProduit)" -ForegroundColor Yellow
    Write-Host "  Name: $($product.nomProduit)" -ForegroundColor Yellow
    Write-Host "  Format: $($product.format)" -ForegroundColor Yellow
    Write-Host "  Price: $($product.prixUnitaire) XOF" -ForegroundColor Yellow
} catch {
    Write-Host "❌ ERROR - Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
