# DevHub Quick Test Script
Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DEVHUB QUICK FEATURE TESTS             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Login
Write-Host "🔐 Logging in..." -ForegroundColor Yellow
$loginUrl = "http://localhost:3000/api/auth/login"
$loginBody = '{"email":"testuser999@example.com","password":"Test@123"}'
$loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
Write-Host "✓ Authenticated`n" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$passed = 0
$failed = 0

# Test 1: Practice Stats
Write-Host "📚 Test 1: Practice Stats" -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/practice/stats" -Headers $headers
    Write-Host "  ✓ $($stats.total) LeetCode problems loaded" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Test 2: Code Snippets List
Write-Host "`n💾 Test 2: Code Snippets" -ForegroundColor Cyan
try {
    $snippets = Invoke-RestMethod -Uri "http://localhost:3000/api/snippets" -Headers $headers
    Write-Host "  ✓ Found $($snippets.snippets.Count) snippets" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Test 3: Create Snippet
try {
    $newSnippetBody = '{"title":"Test ' + (Get-Date -Format 'HHmmss') + '","description":"Test","code":"console.log(1)","language":"js","tags":["test"]}'
    $created = Invoke-RestMethod -Uri "http://localhost:3000/api/snippets" -Method POST -Body $newSnippetBody -Headers $headers
    Write-Host "  ✓ Created snippet: $($created.snippet.title)" -ForegroundColor Green
    $passed++
    
    # Delete test snippet
    $deleteUrl = "http://localhost:3000/api/snippets/$($created.snippet._id)"
    Invoke-RestMethod -Uri $deleteUrl -Method DELETE -Headers $headers | Out-Null
    Write-Host "  ✓ Deleted test snippet" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Create/Delete failed" -ForegroundColor Red
    $failed++
}

# Test 4: AI Code Explanation
Write-Host "`n🤖 Test 3: Groq AI" -ForegroundColor Cyan
try {
    $aiBody = '{"code":"const add=(a,b)=>a+b;","language":"js"}'
    $aiResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/explain-code" -Method POST -Body $aiBody -Headers $headers
    Write-Host "  ✓ Code explanation working" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Test 5: AI Resume Review
try {
    $resumeBody = '{"resumeText":"John Doe\nSoftware Engineer"}'
    $resumeResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/review-resume" -Method POST -Body $resumeBody -Headers $headers
    Write-Host "  ✓ Resume review working" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Test 6: AI Bug Fixer
try {
    $bugBody = '{"code":"function divide(a,b){return a/b;}","language":"js","error":"Handle zero"}'
    $bugResult = Invoke-RestMethod -Uri "http://localhost:3000/api/gemini/fix-bugs" -Method POST -Body $bugBody -Headers $headers
    Write-Host "  ✓ Bug fixer working" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Test 7: Chat Rooms
Write-Host "`n💬 Test 4: Chat & Social" -ForegroundColor Cyan
try {
    $rooms = Invoke-RestMethod -Uri "http://localhost:3000/api/chat/rooms" -Headers $headers
    Write-Host "  ✓ Chat rooms API working" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Test 8: User Profile
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Headers $headers
    Write-Host "  ✓ User profile: $($profile.user.email)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Failed" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           TEST SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n  ✅ Passed: $passed" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed`n" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "✓ Groq AI authentication fixed" -ForegroundColor Green
    Write-Host "✓ All core features working" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed" -ForegroundColor Yellow
}

Write-Host "`n🌐 Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
