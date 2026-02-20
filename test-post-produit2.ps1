[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZWY2YzUxMC05NDIxLTQyYTctYWRkOS1kZTQ2ZDVhMjJhYzQiLCJlbWFpbCI6ImFkbWluQGVzaWtva29lLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTQzMjU2MywiZXhwIjoxNzcxNDMzNDYzfQ.V8erWzmKjl4HMaypVAQ2rqmn96k9YHlFppPWKub8c9k"

$body = @{
    codeProduit = "TEST-002"
    nomProduit = "Test Product 2"
    format = "SACHET"
    categorie = "Test Category"
    stockInitial = 100
    stockMinimum = 10
    prixUnitaire = 5.99
    fournisseur = "Test Supplier"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/produits" -Method Post -Headers $headers -Body $body -UseBasicParsing
    $response.StatusCode
    $response.Content | ConvertFrom-Json | Format-List
} catch {
    "Error Status: $($_.Exception.Response.StatusCode)"
    $_.ErrorDetails.Message
}
