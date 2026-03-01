# DevHub Deployment Guide - MongoDB Atlas & Cloud Hosting

## 🎯 Overview
This guide covers deploying your DevHub application with:
- **MongoDB Atlas** (cloud database with $50 free credit)
- **Application hosting** on Render, Railway, or Vercel/Netlify

---

## Part 1: MongoDB Atlas Setup (5-10 minutes)

### Step 1: Create MongoDB Atlas Account

1. **Sign up for MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google account
   - **Note**: New accounts get $50 free credit!

2. **Create Your First Cluster**
   - Click **"Build a Database"** or **"Create"**
   - Choose **M0 FREE** tier (512 MB storage, perfect for development)
   - Select cloud provider: **AWS** (recommended)
   - Choose region closest to you (or your users)
   - Cluster name: `devhub-cluster` (or your preference)
   - Click **"Create Cluster"** (takes 1-3 minutes to provision)

### Step 2: Configure Database Security

1. **Create Database User**
   - Go to **Database Access** (left sidebar)
   - Click **"Add New Database User"**
   - Authentication Method: **Password**
   - Username: `devhub-admin` (or your choice)
   - Password: Click "Autogenerate Secure Password" (copy it!)
   - Database User Privileges: **Read and write to any database**
   - Click **"Add User"**
   
   **⚠️ SAVE THIS PASSWORD!** You'll need it for the connection string.

2. **Set Up Network Access**
   - Go to **Network Access** (left sidebar)
   - Click **"Add IP Address"**
   - For development/testing: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production: Add your server's specific IP address
   - Click **"Confirm"**
   
   **Security Note**: "Allow from Anywhere" is fine for testing, but restrict to specific IPs in production.

### Step 3: Get Your Connection String

1. **Get Connection String**
   - Go to **Database** (left sidebar)
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Driver: **Node.js**
   - Version: **5.5 or later**
   - Copy the connection string:
   ```
   mongodb+srv://devhub-admin:<password>@devhub-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

2. **Format Your Connection String**
   Replace `<password>` with your actual password:
   ```
   mongodb+srv://devhub-admin:YourActualPassword123@devhub-cluster.xxxxx.mongodb.net/devhub?retryWrites=true&w=majority
   ```
   
   **Important**: Add `/devhub` before the `?` to specify the database name!

3. **Test Connection Locally**
   Update your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://devhub-admin:YourPassword@devhub-cluster.xxxxx.mongodb.net/devhub?retryWrites=true&w=majority
   ```
   
   Restart your server and check if it connects!

---

## Part 2: Application Deployment Options

### Option A: Render (Recommended - Free Tier Available)

**Best for**: Full-stack apps with PostgreSQL/MongoDB

#### Setup Steps:

1. **Push Code to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/devhub.git
   git push -u origin main
   ```

2. **Sign Up for Render**
   - Visit: https://render.com
   - Sign up with GitHub

3. **Create Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Name: `devhub`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: leave empty
   - Runtime: **Node**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free** (or Starter for better performance)

4. **Configure Environment Variables**
   Go to **Environment** tab and add:
   ```
   MONGODB_URI=mongodb+srv://devhub-admin:password@cluster.mongodb.net/devhub
   GROQ_API_KEY=your-groq-api-key-here
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
   SESSION_SECRET=your-session-secret-min-32-chars
   NODE_ENV=production
   PORT=10000
   GOOGLE_CLIENT_ID=your-google-client-id (if configured)
   GOOGLE_CLIENT_SECRET=your-google-secret (if configured)
   VITE_GOOGLE_CLIENT_ID=your-google-client-id (if configured)
   CLIENT_URL=https://your-app-name.onrender.com
   API_BASE_URL=https://your-app-name.onrender.com
   ```

5. **Deploy!**
   - Click **"Create Web Service"**
   - Render will build and deploy automatically
   - Wait 5-10 minutes for first deployment
   - Access your app at: `https://your-app-name.onrender.com`

#### Update Google OAuth Redirect URLs (if using):
   - Go to Google Cloud Console
   - Add authorized origins: `https://your-app-name.onrender.com`
   - Add callback URL: `https://your-app-name.onrender.com/api/auth/google/callback`

---

### Option B: Railway (Simple & Fast)

**Best for**: Quick deployments with minimal config

#### Setup Steps:

1. **Sign Up for Railway**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click **"New Project"**
   - Choose **"Deploy from GitHub repo"**
   - Select your DevHub repository
   - Railway auto-detects Node.js

3. **Add Environment Variables**
   Click **"Variables"** tab and add:
   ```
   MONGODB_URI=mongodb+srv://...
   GROQ_API_KEY=gsk_...
   JWT_SECRET=your-secret
   SESSION_SECRET=your-secret
   NODE_ENV=production
   ```

4. **Configure Build**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Auto-deployed!

5. **Get Public URL**
   - Click **"Settings"** → **"Generate Domain"**
   - Your app is live at: `https://yourapp.up.railway.app`

---

### Option C: Vercel (Frontend) + Render/Railway (Backend)

**Best for**: Separating frontend and backend

#### Frontend on Vercel:

1. **Deploy Frontend**
   - Visit: https://vercel.com
   - Import your GitHub repo
   - Root directory: `client`
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables:
     ```
     VITE_GOOGLE_CLIENT_ID=your-google-client-id
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

2. **Deploy Backend**
   - Use Render or Railway (see above)
   - Only deploy server code
   - Add CORS configuration for your Vercel URL

---

## Part 3: Post-Deployment Configuration

### 1. Update Environment Variables

Make sure all these are set in production:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devhub

# AI Service
GROQ_API_KEY=your-groq-api-key-here

# Security
JWT_SECRET=min-32-characters-super-secret-key-for-production
SESSION_SECRET=another-32-char-secret-for-sessions

# Google OAuth (if configured)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Application URLs
NODE_ENV=production
CLIENT_URL=https://your-app-url.com
API_BASE_URL=https://your-app-url.com
PORT=10000
```

### 2. Generate Strong Secrets

For JWT_SECRET and SESSION_SECRET, generate strong random strings:

```bash
# In Node.js console or terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice to get two different secrets!

### 3. Test Your Deployment

After deployment completes:

1. **Test Database Connection**
   - Check deployment logs for "Connected to MongoDB successfully"
   
2. **Test Basic Functionality**
   - Visit your app URL
   - Register a new account
   - Try logging in
   - Test a few features

3. **Test API Endpoints**
   ```bash
   curl https://your-app.onrender.com/api/ping
   ```

### 4. Monitor Your Application

**MongoDB Atlas Dashboard:**
- Monitor database usage
- Check connection stats
- View slow queries

**Render/Railway Dashboard:**
- View deployment logs
- Monitor CPU/memory usage
- Check request metrics

---

## Part 4: Migration from Local to Atlas

### Migrate Existing Data (Optional)

If you have data in your local MongoDB you want to keep:

#### Method 1: Using MongoDB Compass

1. **Export from Local**
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017/devhub`
   - For each collection: Right-click → Export Collection → JSON
   
2. **Import to Atlas**
   - Connect to your Atlas cluster
   - For each collection: Collection → Import → Select JSON files

#### Method 2: Using mongodump/mongorestore

```bash
# Export local database
mongodump --uri="mongodb://localhost:27017/devhub" --out=./backup

# Import to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/devhub" ./backup/devhub
```

#### Method 3: Let Users Re-register

For a fresh start:
- Deploy with empty database
- Users register new accounts
- Old data stays local as backup

---

## Part 5: Troubleshooting

### Common Issues:

#### "MongoServerError: bad auth"
- **Cause**: Incorrect password or username
- **Fix**: Double-check connection string, ensure password is URL-encoded
- Special characters? Use URL encoding:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`

#### "MongooseServerSelectionError: connection timeout"
- **Cause**: IP not whitelisted
- **Fix**: Add `0.0.0.0/0` to Network Access in Atlas

#### "Cannot connect to MongoDB"
- **Cause**: Wrong connection string format
- **Fix**: Ensure it's:
  ```
  mongodb+srv://user:pass@cluster.mongodb.net/devhub?retryWrites=true&w=majority
  ```

#### "Build failed: MODULE_NOT_FOUND"
- **Cause**: Missing dependencies
- **Fix**: Ensure `package.json` includes all dependencies
- Run `npm install` locally to verify

#### Google OAuth not working
- **Cause**: Redirect URLs not updated
- **Fix**: Add production URL to Google Console authorized redirects

---

## Part 6: Cost Management

### Free Tier Limits:

**MongoDB Atlas M0 (Free):**
- ✓ 512 MB storage
- ✓ Shared RAM
- ✓ Shared vCPU
- Perfect for: ~1,000-5,000 users

**Render Free Tier:**
- ✓ 750 hours/month
- ✓ Auto-sleep after inactivity (spins up on request)
- ✓ 512 MB RAM
- Perfect for: Side projects, demos

**Railway Free Trial:**
- $5 credit per month
- No sleep/wake delays
- Better performance than Render free

### Using Your $50 Atlas Credit:

Your $50 credit covers:
- **M10 Cluster**: ~2 months ($25/month)
- **M2 Cluster**: ~10 months ($5/month)
- Best for: Production apps with steady traffic

---

## Part 7: Quick Reference

### Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Environment Variable Checklist:
- [ ] MONGODB_URI
- [ ] GROQ_API_KEY
- [ ] JWT_SECRET (32+ chars)
- [ ] SESSION_SECRET (32+ chars)
- [ ] NODE_ENV=production
- [ ] GOOGLE_CLIENT_ID (if using OAuth)
- [ ] GOOGLE_CLIENT_SECRET (if using OAuth)
- [ ] CLIENT_URL
- [ ] API_BASE_URL

### Deployment Checklist:
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0 for testing)
- [ ] Environment variables set on hosting platform
- [ ] Build command configured
- [ ] Start command configured
- [ ] First deployment successful
- [ ] Test registration works
- [ ] Test login works
- [ ] Test AI features work

---

## 🚀 Quick Start Commands

### Test Atlas Connection Locally:

```powershell
# Update .env with Atlas URI
# Then restart server:
npm run dev:server
```

### Generate Secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check Deployment Logs:

**Render**: Dashboard → Logs tab
**Railway**: Project → Deployments → View logs

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Deployment Guide](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)

## 🆘 Need Help?

Common commands:
- Test connection: `.\test-atlas-connection.ps1` (see below)
- Check server: `npm run dev:server`
- Build for production: `npm run build`

---

**Ready to deploy? Start with MongoDB Atlas setup above, then choose your hosting platform!**
