[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$response = Invoke-WebRequest -Uri "http://localhost:9000/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@esikokoe.com","password":"AdminPassword123!"}' -UseBasicParsing

$response.Content
