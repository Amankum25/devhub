# Test MongoDB Atlas Connection
# Run this after setting up Atlas and updating .env

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MONGODB ATLAS CONNECTION TEST            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if MONGODB_URI is set
$envContent = Get-Content .env -Raw -ErrorAction SilentlyContinue

if (-not $envContent) {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "  Create .env file with your Atlas connection string" -ForegroundColor Yellow
    exit 1
}

if ($envContent -match 'MONGODB_URI=([^\r\n]+)') {
    $mongoUri = $matches[1].Trim()
    
    Write-Host "📋 MongoDB Configuration:" -ForegroundColor Yellow
    
    if ($mongoUri -like "*mongodb+srv://*") {
        Write-Host "  ✓ Atlas connection string format detected" -ForegroundColor Green
        
        # Check if it's still the placeholder
        if ($mongoUri -like "*localhost*") {
            Write-Host "  ⚠ Still using local MongoDB" -ForegroundColor Yellow
            Write-Host "    Update MONGODB_URI in .env with Atlas string" -ForegroundColor Gray
        } else {
            # Parse connection details (hiding password)
            if ($mongoUri -match 'mongodb\+srv://([^:]+):([^@]+)@([^/]+)(/([^\?]+))?') {
                $username = $matches[1]
                $host = $matches[3]
                $database = if ($matches[5]) { $matches[5] } else { "test" }
                
                Write-Host "  Database Host: $host" -ForegroundColor White
                Write-Host "  Username: $username" -ForegroundColor White
                Write-Host "  Database: $database" -ForegroundColor White
                Write-Host "  Password: ********" -ForegroundColor White
            }
        }
    } elseif ($mongoUri -like "*localhost*") {
        Write-Host "  ℹ Using local MongoDB" -ForegroundColor Cyan
        Write-Host "    To use Atlas: Update MONGODB_URI in .env" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Unknown MongoDB URI format" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ MONGODB_URI not found in .env" -ForegroundColor Red
    Write-Host "  Add: MONGODB_URI=mongodb+srv://..." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🧪 Testing Connection..." -ForegroundColor Yellow

# Create test script
$testScript = @"
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('Attempting connection...');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('✓ CONNECTION SUCCESSFUL!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('✗ CONNECTION FAILED:', err.message);
    process.exit(1);
});
"@

# Save test script
$testScript | Out-File -FilePath "test-connection-temp.js" -Encoding UTF8

# Run test
try {
    $result = node test-connection-temp.js 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ MongoDB Atlas Connection Successful!" -ForegroundColor Green
        Write-Host $result -ForegroundColor White
        
        Write-Host "`n✨ You're ready to deploy!" -ForegroundColor Cyan
        Write-Host "  Next: Follow deployment steps in DEPLOYMENT_GUIDE.md" -ForegroundColor White
    } else {
        Write-Host "`n❌ Connection Failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
        
        Write-Host "`n🔍 Common Fixes:" -ForegroundColor Cyan
        Write-Host "  1. Check password is correct (no special chars issues)" -ForegroundColor White
        Write-Host "  2. Verify IP address is whitelisted (0.0.0.0/0)" -ForegroundColor White
        Write-Host "  3. Ensure /devhub is in connection string" -ForegroundColor White
        Write-Host "  4. Check database user has read/write privileges" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ Test Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Remove-Item "test-connection-temp.js" -ErrorAction SilentlyContinue

Write-Host ""
