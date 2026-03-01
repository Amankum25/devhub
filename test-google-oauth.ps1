#!/usr/bin/env pwsh
# Quick Google OAuth Test Script

Write-Host "`n=== GOOGLE OAUTH STATUS ===" -ForegroundColor Cyan

# Check if credentials are configured
$envFile = Get-Content .env -Raw
$configured = $false

if ($envFile -match 'GOOGLE_CLIENT_ID=([^\r\n]+)') {
    $clientId = $matches[1]
    if ($clientId -notlike "*your-google-client-id*" -and $clientId -notlike "*your-actual*" -and $clientId.Length -gt 20) {
        Write-Host "✓ Backend Client ID configured" -ForegroundColor Green
        $configured = $true
    } else {
        Write-Host "✗ Backend Client ID needs configuration" -ForegroundColor Red
    }
}

if ($envFile -match 'VITE_GOOGLE_CLIENT_ID=([^\r\n]+)') {
    $viteId = $matches[1]
    if ($viteId -notlike "*your-google-client-id*" -and $viteId -notlike "*your-actual*" -and $viteId.Length -gt 20) {
        Write-Host "✓ Frontend Client ID configured" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend Client ID needs configuration" -ForegroundColor Red
        $configured = $false
    }
}

Write-Host ""

if ($configured) {
    Write-Host "✅ Google OAuth is configured!" -ForegroundColor Green
    Write-Host "   Test it at: http://localhost:8080/login" -ForegroundColor Cyan
    
    # Test if servers are running
    $backendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
    $frontendRunning = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
    
    Write-Host "`n   Server Status:" -ForegroundColor Yellow
    if ($backendRunning) {
        Write-Host "   ✓ Backend running (port 3000)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Backend not running" -ForegroundColor Red
        Write-Host "      Start with: npm run dev:server" -ForegroundColor Gray
    }
    
    if ($frontendRunning) {
        Write-Host "   ✓ Frontend running (port 8080)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Frontend not running" -ForegroundColor Red
        Write-Host "      Start with: npm run dev" -ForegroundColor Gray
    }
} else {
    Write-Host "Google OAuth needs setup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Follow these steps:" -ForegroundColor Cyan
    Write-Host "   1. Open GOOGLE_OAUTH_SETUP.md" -ForegroundColor White
    Write-Host "   2. Create credentials in Google Cloud Console" -ForegroundColor White
    Write-Host "   3. Update GOOGLE_CLIENT_ID in .env" -ForegroundColor White
    Write-Host "   4. Update VITE_GOOGLE_CLIENT_ID in .env" -ForegroundColor White
    Write-Host "   5. Restart servers" -ForegroundColor White
}

Write-Host ""
