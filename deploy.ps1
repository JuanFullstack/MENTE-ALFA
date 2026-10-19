Write-Host "Iniciando despliegue a Vercel..." -ForegroundColor Cyan

Write-Host "Construyendo y subiendo proyecto: mente-alfa..." -ForegroundColor Yellow

$tokenArg = if ($env:VERCEL_TOKEN) { "--token $($env:VERCEL_TOKEN)" } else { "" }
$cmd = "npx vercel --prod --yes $tokenArg --name mente-alfa"

Invoke-Expression $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
}
else {
    Write-Host "Error en el despliegue." -ForegroundColor Red
}
