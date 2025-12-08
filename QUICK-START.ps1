# Photography Site - Quick Start Guide

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BF Photography - Quick Start Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you get started with your photography site." -ForegroundColor White
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[Step 1/5] Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$hasDocker = Get-Command docker -ErrorAction SilentlyContinue
$hasNode = Get-Command node -ErrorAction SilentlyContinue

if ($hasDocker) {
    Write-Host "  ✓ Docker is installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Docker is NOT installed" -ForegroundColor Red
    Write-Host "    Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}

if ($hasNode) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js is installed ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js is NOT installed (needed for local development)" -ForegroundColor Yellow
    Write-Host "    Download from: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Choose deployment method
Write-Host "[Step 2/5] Choose your deployment method:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Deploy to Portainer (recommended for home server)" -ForegroundColor White
Write-Host "  2. Run locally with Docker Compose" -ForegroundColor White
Write-Host "  3. Local development (Node.js required)" -ForegroundColor White
Write-Host "  4. Just show me the instructions" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "=== Portainer Deployment ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Steps to deploy to Portainer:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Build the Docker image:" -ForegroundColor Yellow
    Write-Host "   cd photography-cms" -ForegroundColor Gray
    Write-Host "   .\build-and-deploy.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. In Portainer UI:" -ForegroundColor Yellow
    Write-Host "   - Go to Stacks → Add Stack" -ForegroundColor Gray
    Write-Host "   - Name: photography-cms" -ForegroundColor Gray
    Write-Host "   - Copy contents from: photography-cms\portainer-stack.yml" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Add environment variables in Portainer:" -ForegroundColor Yellow
    Write-Host "   PAYLOAD_SECRET=<generate with: openssl rand -base64 32>" -ForegroundColor Gray
    Write-Host "   PAYLOAD_PUBLIC_SERVER_URL=http://your-server-ip:3000" -ForegroundColor Gray
    Write-Host "   ADMIN_EMAIL=your@email.com" -ForegroundColor Gray
    Write-Host "   ADMIN_PASSWORD=secure-password" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_CLOUD_NAME=your-cloud-name" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_API_KEY=your-api-key" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_API_SECRET=your-api-secret" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Deploy the stack and access:" -ForegroundColor Yellow
    Write-Host "   http://your-server-ip:3000/admin" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Full guide: photography-cms\DEPLOYMENT.md" -ForegroundColor Cyan

} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "=== Docker Compose Deployment ===" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $hasDocker) {
        Write-Host "Error: Docker is required for this option" -ForegroundColor Red
        exit 1
    }

    Write-Host "Starting Docker Compose setup..." -ForegroundColor Yellow
    Write-Host ""

    Set-Location photography-cms

    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env file from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host ""
        Write-Host "Please edit .env file with your settings:" -ForegroundColor Yellow
        Write-Host "  - PAYLOAD_SECRET (generate with: openssl rand -base64 32)" -ForegroundColor Gray
        Write-Host "  - ADMIN_EMAIL and ADMIN_PASSWORD" -ForegroundColor Gray
        Write-Host "  - Cloudinary credentials (optional)" -ForegroundColor Gray
        Write-Host ""
        Read-Host "Press Enter after editing .env to continue"
    }

    Write-Host "Building and starting containers..." -ForegroundColor Yellow
    docker-compose up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Containers started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access your CMS at:" -ForegroundColor Cyan
        Write-Host "  Admin Panel: http://localhost:3000/admin" -ForegroundColor White
        Write-Host "  API: http://localhost:3000/api" -ForegroundColor White
        Write-Host ""
        Write-Host "View logs: docker-compose logs -f" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "✗ Failed to start containers" -ForegroundColor Red
    }

} elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "=== Local Development Setup ===" -ForegroundColor Cyan
    Write-Host ""

    if (-not $hasNode) {
        Write-Host "Error: Node.js is required for local development" -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }

    Set-Location photography-cms

    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install

    if (-not (Test-Path ".env")) {
        Write-Host ""
        Write-Host "Creating .env file..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host ""
        Write-Host "Please edit .env file with your settings" -ForegroundColor Yellow
        Read-Host "Press Enter after editing to continue"
    }

    Write-Host ""
    Write-Host "Starting MongoDB container..." -ForegroundColor Yellow
    docker run -d -p 27017:27017 --name photography-mongodb mongo:7

    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run: npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then access:" -ForegroundColor White
    Write-Host "  Admin: http://localhost:3000/admin" -ForegroundColor Gray
    Write-Host "  API: http://localhost:3000/api" -ForegroundColor Gray

} else {
    Write-Host ""
    Write-Host "=== Quick Reference ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Documentation files:" -ForegroundColor Yellow
    Write-Host "  📖 README-COMPLETE.md - Full project guide" -ForegroundColor White
    Write-Host "  📖 photography-cms/README.md - CMS documentation" -ForegroundColor White
    Write-Host "  📖 photography-cms/DEPLOYMENT.md - Deployment guide" -ForegroundColor White
    Write-Host "  📖 photography-cms/IMPLEMENTATION-SUMMARY.md - Technical details" -ForegroundColor White
    Write-Host ""
    Write-Host "Key commands:" -ForegroundColor Yellow
    Write-Host "  Build Docker image:" -ForegroundColor White
    Write-Host "    cd photography-cms && .\build-and-deploy.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Local development:" -ForegroundColor White
    Write-Host "    cd photography-cms && npm install && npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Docker Compose:" -ForegroundColor White
    Write-Host "    cd photography-cms && docker-compose up -d" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Environment variables needed:" -ForegroundColor Yellow
    Write-Host "  PAYLOAD_SECRET - Random secret key" -ForegroundColor White
    Write-Host "  ADMIN_EMAIL - Your admin email" -ForegroundColor White
    Write-Host "  ADMIN_PASSWORD - Secure password" -ForegroundColor White
    Write-Host "  CLOUDINARY_* - Cloudinary credentials (optional)" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Need help? Check the documentation or visit:" -ForegroundColor Cyan
Write-Host "  Payload CMS: https://payloadcms.com/docs" -ForegroundColor Gray
Write-Host "  Docker: https://docs.docker.com/" -ForegroundColor Gray
Write-Host "  Portainer: https://docs.portainer.io/" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Happy photographing! 📸" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
