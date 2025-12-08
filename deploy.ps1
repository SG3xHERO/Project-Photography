# Photography Site - Complete Build and Deploy Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Photography Site - Build & Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Error: Docker is not installed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is installed" -ForegroundColor Green

# Check current directory
$currentDir = Get-Location
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "✗ Error: docker-compose.yml not found" -ForegroundColor Red
    Write-Host "  Please run this script from the Project-Photography root directory" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Found docker-compose.yml" -ForegroundColor Green
Write-Host ""

# Step 1: Build CMS Image
Write-Host "[Step 1/4] Building CMS Docker image..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "photography-cms/Dockerfile")) {
    Write-Host "✗ Error: photography-cms/Dockerfile not found" -ForegroundColor Red
    exit 1
}

Push-Location photography-cms
docker build -t photography-cms:latest .
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "✗ Failed to build CMS image" -ForegroundColor Red
    exit 1
}

Write-Host "✓ CMS image built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Check/Create .env file
Write-Host "[Step 2/4] Checking environment configuration..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please configure your environment variables!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required settings in .env:" -ForegroundColor Cyan
    Write-Host "  - PAYLOAD_SECRET (generate: openssl rand -base64 32)" -ForegroundColor White
    Write-Host "  - PAYLOAD_PUBLIC_SERVER_URL (e.g., http://192.168.1.100:3000)" -ForegroundColor White
    Write-Host "  - ADMIN_EMAIL" -ForegroundColor White
    Write-Host "  - ADMIN_PASSWORD" -ForegroundColor White
    Write-Host ""
    Write-Host "Optional (recommended):" -ForegroundColor Cyan
    Write-Host "  - CLOUDINARY_CLOUD_NAME" -ForegroundColor White
    Write-Host "  - CLOUDINARY_API_KEY" -ForegroundColor White
    Write-Host "  - CLOUDINARY_API_SECRET" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Press Enter after editing .env file, or Ctrl+C to cancel"
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Choose deployment method
Write-Host "[Step 3/4] Choose deployment method:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Deploy with Docker Compose (local/testing)" -ForegroundColor White
Write-Host "  2. Prepare for Portainer deployment" -ForegroundColor White
Write-Host "  3. Both" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1-3)"

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host ""
    Write-Host "[Step 4/4] Starting services with Docker Compose..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Services started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access your site:" -ForegroundColor Cyan
        Write-Host "  Frontend: http://localhost:8080" -ForegroundColor White
        Write-Host "  CMS Admin: http://localhost:3000/admin" -ForegroundColor White
        Write-Host "  CMS API: http://localhost:3000/api" -ForegroundColor White
        Write-Host ""
        Write-Host "View logs:" -ForegroundColor Cyan
        Write-Host "  docker-compose logs -f" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Stop services:" -ForegroundColor Cyan
        Write-Host "  docker-compose down" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to start services" -ForegroundColor Red
        Write-Host ""
        Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
    }
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host ""
    Write-Host "[Portainer Deployment Instructions]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✓ CMS image is ready: photography-cms:latest" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps for Portainer:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. If deploying to a different server, export the image:" -ForegroundColor White
    Write-Host "   docker save photography-cms:latest -o photography-cms.tar" -ForegroundColor Gray
    Write-Host "   # Transfer to server and load:" -ForegroundColor Gray
    Write-Host "   docker load -i photography-cms.tar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. In Portainer UI:" -ForegroundColor White
    Write-Host "   - Go to Stacks → Add Stack" -ForegroundColor Gray
    Write-Host "   - Name: photography-site" -ForegroundColor Gray
    Write-Host "   - Build method: Web editor" -ForegroundColor Gray
    Write-Host "   - Copy contents from: docker-compose.yml (in root folder)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Add environment variables in Portainer:" -ForegroundColor White
    Write-Host "   PAYLOAD_SECRET=<your-secret>" -ForegroundColor Gray
    Write-Host "   PAYLOAD_PUBLIC_SERVER_URL=http://your-server-ip:3000" -ForegroundColor Gray
    Write-Host "   ADMIN_EMAIL=admin@example.com" -ForegroundColor Gray
    Write-Host "   ADMIN_PASSWORD=secure-password" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_CLOUD_NAME=your-cloud-name (optional)" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_API_KEY=your-api-key (optional)" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_API_SECRET=your-api-secret (optional)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Deploy the stack!" -ForegroundColor White
    Write-Host ""
    Write-Host "Full guide: DOCKER-DEPLOYMENT.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
