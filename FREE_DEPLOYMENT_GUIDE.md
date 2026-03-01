# 🚀 Free Deployment Guide - Vercel + Render + MongoDB Atlas

## Overview
This guide shows you how to deploy your full-stack app **completely FREE**:
- **Frontend**: Vercel (unlimited bandwidth on free tier)
- **Backend**: Render (750 hours/month free)
- **Database**: MongoDB Atlas (512MB M0 cluster free)
- **Auth**: Google OAuth (free)

---

## ✅ What You Get FREE:
- ✨ Frontend on global CDN (Vercel)
- 🚀 Express backend with WebSockets support (Render)
- 💾 MongoDB Atlas M0 cluster (512MB)
- 🔐 Google OAuth authentication
- 🌐 Custom domain support (optional)
- 📊 Basic analytics

---

## 📋 Step-by-Step Deployment

### **Step 1: MongoDB Atlas Setup (5 minutes)**

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google/email

2. **Create Free Cluster**
   ```
   - Click "Build a Database"
   - Choose "M0 FREE" cluster
   - Select closest region (AWS/Google Cloud)
   - Cluster name: devhub-cluster
   - Click "Create"
   ```

3. **Database Access**
   ```
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: devhub_admin
   - Password: Generate secure password (SAVE THIS!)
   - Built-in Role: "Read and write to any database"
   - Click "Add User"
   ```

4. **Network Access**
   ```
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   ```

5. **Get Connection String**
   ```
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string:
   
   mongodb+srv://devhub_admin:<password>@devhub-cluster.xxxxx.mongodb.net/devhub?retryWrites=true&w=majority
   
   - Replace <password> with your actual password
   - This is your MONGODB_URI
   ```

---

### **Step 2: Deploy Backend to Render (10 minutes)**

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub (connects your repo)

2. **Create Web Service**
   ```
   - Dashboard → "New +" → "Web Service"
   - Connect GitHub repository: Amankum25/devhub
   - Configure:
     * Name: devhub-api
     * Region: Choose closest
     * Branch: main
     * Root Directory: (leave empty)
     * Runtime: Node
     * Build Command: npm install
     * Start Command: node server/index.js
     * Instance Type: Free
   ```

3. **Environment Variables**
   Click "Advanced" → Add environment variables:
   ```
   PORT=10000
   NODE_ENV=production
   
   MONGODB_URI=mongodb+srv://devhub_admin:YOUR_PASSWORD@devhub-cluster.xxxxx.mongodb.net/devhub?retryWrites=true&w=majority
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
   SESSION_SECRET=your-session-secret-key-change-this
   
   GOOGLE_CLIENT_ID=926921206176-ffeokg9mkm4pk3vl795aefl5h28cp2j6.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   
   GROQ_API_KEY=your_groq_api_key_here
   
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build (2-5 minutes)
   - Your backend URL: `https://devhub-api.onrender.com`

---

### **Step 3: Deploy Frontend to Vercel (5 minutes)**

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```
   - Verify via email

3. **Deploy from Project Root**
   ```powershell
   cd C:\Users\amank\OneDrive\Desktop\devhub
   vercel
   ```
   
   Answer prompts:
   ```
   ? Set up and deploy "~/devhub"? [Y/n] Y
   ? Which scope? Your personal account
   ? Link to existing project? [y/N] N
   ? What's your project's name? devhub
   ? In which directory is your code located? ./
   ? Want to override the settings? [y/N] N
   ```

4. **Configure Environment Variables**
   ```powershell
   vercel env add VITE_API_URL
   ```
   Enter: `https://devhub-api.onrender.com`
   
   Select: Production, Preview, Development (select all)

5. **Production Deploy**
   ```powershell
   vercel --prod
   ```
   
   Your frontend URL: `https://devhub-xxxxx.vercel.app`

---

### **Step 4: Update Google OAuth (3 minutes)**

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/
   - Select your project

2. **Update Authorized Redirect URIs**
   ```
   - APIs & Services → Credentials
   - Click your OAuth 2.0 Client ID
   - Add to "Authorized redirect URIs":
   
   https://devhub-xxxxx.vercel.app/auth/callback
   https://devhub-api.onrender.com/api/auth/google/callback
   
   - Save
   ```

---

### **Step 5: Connect Frontend to Backend**

Update your frontend API URL:

1. **Create .env.production in project root:**
   ```env
   VITE_API_URL=https://devhub-api.onrender.com
   ```

2. **Commit and redeploy:**
   ```powershell
   git add .env.production
   git commit -m "Add production API URL"
   git push origin main
   vercel --prod
   ```

---

## 🎯 Quick Reference URLs

After deployment, save these:

```
Frontend:  https://devhub-xxxxx.vercel.app
Backend:   https://devhub-api.onrender.com
Database:  MongoDB Atlas M0 cluster
API Test:  https://devhub-api.onrender.com/api/ping
```

---

## ⚠️ Important Notes

1. **Render Free Tier Limitations:**
   - Spins down after 15 minutes of inactivity
   - **First request** after sleep = 30-60 second cold start
   - 750 hours/month (enough for hobby projects)

2. **To Keep Backend Always On (Optional $7/month):**
   - Upgrade Render to "Starter" plan
   - Or ping your backend every 10 minutes with a cron job

3. **MongoDB Atlas Free Tier:**
   - 512MB storage (good for ~10,000 users)
   - Shared CPU
   - Upgrade to M10+ when you need more

4. **Vercel Free Tier:**
   - 100GB bandwidth/month
   - Unlimited projects
   - Custom domain supported

---

## 🔧 Troubleshooting

### Backend not responding:
```powershell
# Test backend health
curl https://devhub-api.onrender.com/api/ping
```

### Frontend can't reach API:
- Check `VITE_API_URL` in Vercel dashboard
- Verify CORS settings allow your Vercel domain
- Check Render logs for errors

### MongoDB connection failed:
- Verify MONGODB_URI has correct password
- Check Network Access allows 0.0.0.0/0
- Ensure database user has read/write permissions

---

## 💡 Cost Breakdown

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| Vercel | Yes | 100GB bandwidth, unlimited deploys |
| Render | Yes | 750 hours/month, 512MB RAM |
| MongoDB Atlas | Yes | 512MB storage, shared cluster |
| Google OAuth | Yes | Unlimited users |
| **TOTAL** | **$0/month** | Full production app |

---

## 🚀 Next Steps After Deployment

1. **Test Google Login** on production URL
2. **Add Custom Domain** (optional)
   - Vercel: Dashboard → Settings → Domains
   - Render: Dashboard → Settings → Custom Domain

3. **Monitor Performance**
   - Vercel Analytics: Built-in
   - Render Metrics: Dashboard
   - MongoDB Atlas: Cluster metrics

4. **Set Up Ping Service** (keep Render awake)
   - Use [UptimeRobot](https://uptimerobot.com/) (free)
   - Ping `https://devhub-api.onrender.com/api/ping` every 5 minutes

---

## ❓ FAQ

**Q: Why not deploy backend to Vercel too?**
A: Vercel serverless functions have 10s timeout and no WebSocket support. Your app uses socket.io for real-time features.

**Q: Will my backend go to sleep?**
A: Yes, Render free tier spins down after 15min inactivity. First request will be slow (30-60s). Use UptimeRobot to prevent this.

**Q: Can I upgrade later?**
A: Absolutely! All platforms have paid tiers:
- Render: $7/month for always-on
- MongoDB Atlas: $9/month for M10 cluster
- Vercel: $20/month for team features

**Q: How much traffic can I handle for free?**
A: Approximately:
- 50,000 page views/month (Vercel)
- 1,000 concurrent users (Render free tier)
- 512MB data storage (MongoDB)

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user and password saved
- [ ] Network access configured (0.0.0.0/0)
- [ ] Backend deployed to Render
- [ ] All environment variables set on Render
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL configured on Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] Test login on production
- [ ] Set up UptimeRobot (optional, to prevent cold starts)

---

**Need Help?** Check deployment logs:
- Render: Dashboard → Logs tab
- Vercel: Dashboard → Deployments → Click deployment → Logs
- MongoDB: Atlas → Metrics tab
