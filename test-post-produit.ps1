[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZWY2YzUxMC05NDIxLTQyYTctYWRkOS1kZTQ2ZDVhMjJhYzQiLCJlbWFpbCI6ImFkbWluQGVzaWtva29lLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTQzMjQyMiwiZXhwIjoxNzcxNDMzMzIyfQ.Xu7K56_IDL1ai2gF12hlgJdZyjY-mc3OI0CYlFnD9rc"

$body = @{
    codeProduit = "TEST-001"
    nomProduit = "Test Product"
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

$response = Invoke-WebRequest -Uri "http://localhost:9000/produits" -Method Post -Headers $headers -Body $body -UseBasicParsing

$response.StatusCode
$response.Content | ConvertFrom-Json | Format-List
