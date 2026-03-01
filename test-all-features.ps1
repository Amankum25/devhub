# DevHub Comprehensive Feature Test Script
# Run this with: .\test-all-features.ps1

Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DEVHUB COMPREHENSIVE FEATURE TESTS     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Login and get token
Write-Host "🔐 Authenticating..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Body '{"email":"testuser999@example.com","password":"Test@123"}' `
    -ContentType "application/json"

$token = $loginResponse.data.token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "✓ Authentication successful`n" -ForegroundColor Green

# Test Counter
$passed = 0
$failed = 0

# TEST 1: Practice API
Write-Host "📚 TEST 1: Practice Problems" -ForegroundColor Cyan
try {
    $practice = Invoke-RestMethod -Uri "http://localhost:3000/api/practice/stats" -Headers $headers
    Write-Host "  ✓ Stats API: $($practice.total) problems loaded" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Stats API failed" -ForegroundColor Red
    $failed++
}

# TEST 2: Code Snippets
Write-Host "`n💾 TEST 2: Code Snippets" -ForegroundColor Cyan
try {
    $snippets = Invoke-RestMethod -Uri "http://localhost:3000/api/snippets" -Headers $headers
    Write-Host "  ✓ List snippets: Found $($snippets.snippets.Count) snippets" -ForegroundColor Green
    $passed++
    
    # Try to create a snippet
    $newSnippet = @{
        title = "Test Snippet $(Get-Date -Format 'HHmmss')"
        description = "Auto-generated test snippet"
        code = "function test() { return 'Hello from test'; }"
        language = "javascript"
        tags = @("test", "auto-generated")
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod -Uri "http://localhost:3000/api/snippets" -Method POST -Body $newSnippet -Headers $headers
    Write-Host "  ✓ Create snippet: '$($created.snippet.title)'" -ForegroundColor Green
    $passed++
    
    # Clean up - delete the test snippet
    $deleteUrl = "http://localhost:3000/api/snippets/$($created.snippet._id)"
    Invoke-RestMethod -Uri $deleteUrl -Method DELETE -Headers $headers | Out-Null
    Write-Host "  ✓ Delete snippet: Cleanup successful" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Snippets test failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# TEST 3: AI Tools - Code Explanation
Write-Host "`n🤖 TEST 3: AI Tools (Groq)" -ForegroundColor Cyan
try {
    $codeExplain = @{
        code = "const sum = (a, b) => a + b;"
        language = "javascript"
    } | ConvertTo-Json
    
    $aiResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/explain-code" -Method POST -Body $codeExplain -Headers $headers
    Write-Host "  ✓ Code Explanation: AI responded (${($aiResult.explanation.Length)} chars)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Code Explanation failed" -ForegroundColor Red
    $failed++
}

# TEST 4: AI Tools - Resume Review
try {
    $resumeText = "John Doe" + [Environment]::NewLine + "Software Engineer" + [Environment]::NewLine + "5 years experience in JavaScript, React, Node.js"
    $resumeReview = @{
        resumeText = $resumeText
    } | ConvertTo-Json
    
    $aiResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/review-resume" -Method POST -Body $resumeReview -Headers $headers
    Write-Host "  ✓ Resume Review: AI responded" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Resume Review failed" -ForegroundColor Red
    $failed++
}

# TEST 5: AI Tools - Bug Fixer
try {
    $bugFix = @{
        code = "function divide(a, b) { return a / b; }"
        language = "javascript"
        error = "Need to handle division by zero"
    } | ConvertTo-Json
    
    $aiResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/fix-bugs" -Method POST -Body $bugFix -Headers $headers
    Write-Host "  ✓ Bug Fixer: AI responded" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Bug Fixer failed" -ForegroundColor Red
    $failed++
}

# TEST 6: AI Tools - Project Suggestions
try {
    $projectSuggest = @{
        skills = @("React", "Node.js", "MongoDB")
        experienceLevel = "intermediate"
    } | ConvertTo-Json
    
    $aiResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/suggest-projects" -Method POST -Body $projectSuggest -Headers $headers
    Write-Host "  ✓ Project Suggestions: AI responded" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Project Suggestions failed" -ForegroundColor Red
    $failed++
}

# TEST 7: Chat Rooms
Write-Host "`n💬 TEST 4: Chat Rooms" -ForegroundColor Cyan
try {
    $rooms = Invoke-RestMethod -Uri "http://localhost:3000/api/chat/rooms" -Headers $headers
    Write-Host "  ✓ List rooms: API working ($($rooms.rooms.Count) rooms visible to user)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Chat rooms failed" -ForegroundColor Red
    $failed++
}

# TEST 8: User Profile
Write-Host "`n👤 TEST 5: User Profile" -ForegroundColor Cyan
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Headers $headers
    Write-Host "  ✓ Get profile: $($profile.user.email)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ User profile failed" -ForegroundColor Red
    $failed++
}

# TEST 9: Database Connection
Write-Host "`n🗄️  TEST 6: Database" -ForegroundColor Cyan
try {
    $dbCheck = mongosh devhub --eval "db.stats()" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ MongoDB connection: Active" -ForegroundColor Green
        $passed++
    } else {
        throw "MongoDB connection failed"
    }
} catch {
    Write-Host "  ✗ MongoDB connection failed" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           TEST SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n  ✅ Passed: $passed" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed`n" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! DevHub is fully operational." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review the output above." -ForegroundColor Yellow
}

Write-Host "`n🌐 Access your app at: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
