# Render Environment Variables Setup

## Required Environment Variables

These must be set in your **Render Dashboard → Environment tab**:

### 1. Database (REQUIRED)
```
MONGODB_URI=mongodb+srv://bt23cse058_db_user:w6AhULoH9ZTw3t5r@cluster0.s9e31kx.mongodb.net/devhub
```

### 2. Frontend URL (REQUIRED)
```
FRONTEND_URL=https://devhub-eta.vercel.app
```

### 3. Google OAuth (REQUIRED for login)
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Auto-Generated (Render creates these automatically)
✅ JWT_SECRET
✅ JWT_REFRESH_SECRET  
✅ SESSION_SECRET

### 5. Optional (for AI features)
```
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-key-here
```

### 6. Fixed Values (Already set in render.yaml)
✅ NODE_ENV=production
✅ PORT=3000

---

## Verification Checklist

After setting environment variables:

- [ ] MONGODB_URI is set to your Atlas connection string
- [ ] FRONTEND_URL is set to https://devhub-eta.vercel.app
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- [ ] PORT is 3000 (already configured)
- [ ] Health Check Path is `/api/ping`
- [ ] Auto-Deploy is enabled (Settings → Build & Deploy)

---

## Google OAuth Configuration

Don't forget to add these to your Google Cloud Console:

**Authorized JavaScript origins:**
- https://devhub-eta.vercel.app
- https://devhub-xzq7onrender.com

**Authorized redirect URIs:**
- https://devhub-eta.vercel.app/auth/callback
- https://devhub-xzq7onrender.com/api/auth/google/callback

---

## Deployment Flow

1. **Push to GitHub** → Render auto-deploys (if enabled)
2. **Build** → `npm install`
3. **Start** → `node server/start.js`
4. **Health Check** → GET `/api/ping` (every 10s)
5. **Live** → Backend responds with 200 status

---

## Troubleshooting

**404 on /api/ping:**
- Trigger Manual Deploy in Render dashboard
- Check logs for deployment completion

**CORS errors:**
- Verify FRONTEND_URL matches Vercel URL exactly
- Check Google OAuth redirect URIs include production URLs

**MongoDB connection failed:**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas Network Access allows 0.0.0.0/0

**Port timeout:**
- Ensure PORT is set to 3000 in environment
- Verify no conflicting PORT value in dashboard
