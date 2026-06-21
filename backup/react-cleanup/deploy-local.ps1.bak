# Script de Deploy Local Automático - Z-Core
$root = Get-Location

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Z-CORE - PREPARANDO DEPLOY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Backend
Write-Host "`n[1/3] Instalando dependências do backend..." -ForegroundColor Yellow
Set-Location "$root\backend"
npm install

# 2. React Frontend
Write-Host "`n[2/3] Construindo React Frontend..." -ForegroundColor Yellow
Set-Location "$root\react-frontend"
npm install
npm run build

# 3. Finalizando
Write-Host "`n[3/3] Iniciando o sistema..." -ForegroundColor Green
Set-Location $root
Write-Host "`nAcesse: http://localhost:3000" -ForegroundColor Green
npm start
