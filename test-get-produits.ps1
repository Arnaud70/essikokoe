[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Testing GET /produits (public endpoint)..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:9000/produits?skip=0&take=10" -UseBasicParsing
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host ""
$products = $response.Content | ConvertFrom-Json
Write-Host "Total produits: $($products.total)" -ForegroundColor Yellow  
if ($products.data.Count -gt 0) {
    Write-Host "Produits trouvés:" -ForegroundColor Cyan
    $products.data | ForEach-Object {
        Write-Host "  - $($_.nomProduit) ($($_.codeProduit)) - Format: $($_.format)" -ForegroundColor White
    }
}
