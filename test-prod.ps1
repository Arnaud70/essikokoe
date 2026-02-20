[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZWY2YzUxMC05NDIxLTQyYTctYWRkOS1kZTQ2ZDVhMjJhYzQiLCJlbWFpbCI6ImFkbWluQGVzaWtva29lLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTQzMjgxNSwiZXhwIjoxNzcxNDMzNzE1fQ.Bq7MeeTWvod0sZuRQo6Jnc8bYmkE8nLwJw-d70jZ9VY"

$body = @{
    codeProduit = "PROD-$(Get-Random)"
    nomProduit = "Test Product"
    format = "SACHET"
    categorie = "Test"
    stockInitial = 100
    stockMinimum = 10
    prixUnitaire = 5.99
    fournisseur = "Supplier"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/produits" -Method Post -Headers $headers -Body $body -UseBasicParsing
    $response.StatusCode
    $response.Content | ConvertFrom-Json
} catch {
    $_.Exception.Response.StatusCode
    $_.ErrorDetails.Message
}
