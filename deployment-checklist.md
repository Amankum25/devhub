# DevHub Deployment Checklist

## Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Created MongoDB Atlas account
- [ ] Created M0 free cluster (or better with $50 credit)
- [ ] Created database user with password
- [ ] Added IP whitelist (0.0.0.0/0 for testing)
- [ ] Got connection string
- [ ] Added `/devhub` database name to connection string
- [ ] Tested connection locally with `.\test-atlas-connection.ps1`

### 2. Environment Variables Prepared
- [ ] MONGODB_URI (Atlas connection string)
- [ ] GROQ_API_KEY
- [ ] JWT_SECRET (generated 32+ char secret)
- [ ] SESSION_SECRET (generated 32+ char secret)
- [ ] NODE_ENV=production
- [ ] Google OAuth credentials (if using)

### 3. Code Ready for Deployment
- [ ] All features tested locally
- [ ] Code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in code (all in .env)
- [ ] Build command works: `npm run build`
- [ ] Start command works: `npm start`

## Deployment Steps

### Option A: Render
- [ ] Signed up at render.com
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Added all environment variables
- [ ] Triggered deployment
- [ ] Verified deployment logs
- [ ] Tested deployed app

### Option B: Railway
- [ ] Signed up at railway.app
- [ ] Created project from GitHub
- [ ] Added environment variables
- [ ] Generated public domain
- [ ] Tested deployed app

### Option C: Vercel (Frontend) + Render (Backend)
- [ ] Deployed backend to Render/Railway
- [ ] Got backend URL
- [ ] Deployed frontend to Vercel with VITE_API_URL
- [ ] Configured CORS on backend
- [ ] Tested connection

## Post-Deployment

### 1. Update OAuth Redirects (if using Google)
- [ ] Added production URL to Google Console authorized origins
- [ ] Added callback URL to Google Console redirects
- [ ] Tested Google login on production

### 2. Test Core Features
- [ ] Registration works
- [ ] Login works
- [ ] Practice page loads problems
- [ ] AI features work (code explain, resume review, etc.)
- [ ] Code snippets load
- [ ] Chat rooms accessible
- [ ] User profile displays correctly

### 3. Monitor & Maintain
- [ ] Bookmarked MongoDB Atlas dashboard
- [ ] Bookmarked hosting platform dashboard
- [ ] Set up error monitoring (optional)
- [ ] Documented any custom configurations

## Quick Reference

### Generate Secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Atlas Connection:
```powershell
.\test-atlas-connection.ps1
```

### Deployment URLs:
- MongoDB Atlas: https://cloud.mongodb.com
- Render: https://dashboard.render.com
- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard

### My App URLs:
- Production: ___________________________
- Backend API: ___________________________
- MongoDB Atlas: ___________________________

## Notes:
_Use this space for any deployment-specific notes, issues, or configurations_

---

**Status**: [ ] Not Started  [ ] In Progress  [ ] Deployed  [ ] Tested
**Deployed Date**: _______________
**Platform**: _______________
