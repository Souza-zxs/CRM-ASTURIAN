# Zyra - helper de desenvolvimento para Windows (npm + Vite)
# Uso:
#   ./zyra.ps1          -> sobe serviços + front + server + worker (dia a dia)
#   ./zyra.ps1 -Setup   -> primeira vez: install + serviços + init do banco
param(
    [switch]$Setup
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Test-Docker {
    try {
        docker info *> $null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-Docker)) {
    Write-Host "ERRO: Docker Desktop nao esta rodando. Abra o Docker Desktop e tente de novo." -ForegroundColor Red
    exit 1
}

if ($Setup) {
    Write-Host "==> Instalando dependencias (npm install)..." -ForegroundColor Cyan
    npm install

    Write-Host "==> Subindo Postgres + Redis..." -ForegroundColor Cyan
    npm run services:up

    Write-Host "==> Inicializando o banco de dados..." -ForegroundColor Cyan
    npm run db:init

    Write-Host "Setup concluido. Rode ./zyra.ps1 para iniciar o ambiente." -ForegroundColor Green
    exit 0
}

if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules nao encontrado. Rode primeiro: ./zyra.ps1 -Setup" -ForegroundColor Yellow
    exit 1
}

# Aplica a marca selecionada em $env:ZYRA_BRAND (padrao "zyra") antes de
# subir o ambiente -- idempotente, ver brands/README.md.
node scripts/select-brand.mjs

Write-Host "==> Iniciando Zyra (front :3001, server :3000, worker)..." -ForegroundColor Cyan
npm run dev
