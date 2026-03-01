# Google OAuth Setup Guide for DevHub

## 📋 Overview
Your DevHub application already has **complete Google OAuth implementation**. You just need to configure the Google credentials.

## ✅ What's Already Implemented:
- ✓ GoogleLoginButton component with Google Identity Services
- ✓ Backend authentication routes (`/api/auth/google`)
- ✓ Google token verification service
- ✓ User creation/login flow
- ✓ Session management integration
- ✓ google-auth-library package installed

## 🔧 Setup Steps:

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "DevHub" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type
   - Click "Create"
   
   **Fill in required fields:**
   - App name: DevHub
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   
   **Scopes page:**
   - Click "Add or Remove Scopes"
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Update" → "Save and Continue"
   
   **Test users (for development):**
   - Add your Gmail addresses for testing
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "DevHub Web Client"
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:8080
   http://localhost:3000
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:8080/auth/callback
   ```
   
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these next!)

### Step 2: Configure Environment Variables

Update your `.env` file with the credentials you just copied:

```env
# Replace these with your actual Google OAuth credentials
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com

# These should already be set
GROQ_API_KEY=your-groq-api-key-here
JWT_SECRET=your-jwt-secret-here
```

### Step 3: Restart Your Servers

After updating the `.env` file:

```powershell
# Stop current servers (Ctrl+C in each terminal)

# Start backend
npm run dev:server

# Start frontend (in new terminal)
npm run dev
```

### Step 4: Test Google Login

1. Open http://localhost:8080/login
2. Click "Continue with Google" button
3. Select your Google account
4. Grant permissions
5. You should be logged in automatically!

## 🧪 Testing Checklist:

- [ ] Google button appears on login page
- [ ] Clicking opens Google authentication popup
- [ ] After selecting account, redirects back to app
- [ ] User is logged in with Google account
- [ ] User profile shows Google avatar
- [ ] Can navigate app with Google auth

## 🔍 Troubleshooting:

### Error: "Google client ID not configured"
- Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Restart the frontend server (Vite needs restart for env changes)

### Error: "origin_mismatch" or "redirect_uri_mismatch"
- Verify authorized origins/redirects in Google Console match exactly:
  - `http://localhost:8080` (no trailing slash)
  - `http://localhost:3000/api/auth/google/callback` (exact path)

### Google popup doesn't open
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Try in incognito mode (extensions can block popups)

### "Access blocked: DevHub has not completed verification"
- This is normal for development
- Add your email as a test user in OAuth consent screen
- Or set OAuth consent to "Testing" mode

## 📱 How It Works:

1. **User clicks "Continue with Google"**
   - Frontend loads Google Identity Services
   - Shows Google account picker

2. **User selects account**
   - Google verifies identity
   - Returns ID token to your app

3. **Frontend sends token to backend**
   - POST `/api/auth/google` with ID token
   - Backend verifies token with Google
   - Creates or updates user in MongoDB
   - Returns JWT token and user data

4. **User is logged in**
   - JWT stored in localStorage
   - User redirected to dashboard
   - All API calls use JWT for authentication

## 🔒 Security Features:

- ✓ Google token verification on backend
- ✓ JWT session management
- ✓ Database session tracking
- ✓ Automatic user creation/update
- ✓ Email verification from Google
- ✓ Secure token storage

## 🚀 Production Deployment:

When deploying to production:

1. Update authorized origins/redirects in Google Console:
   ```
   https://yourapp.com
   https://yourapp.com/auth/callback
   ```

2. Update production `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   VITE_GOOGLE_CLIENT_ID=your-client-id
   CLIENT_URL=https://yourapp.com
   API_BASE_URL=https://api.yourapp.com
   ```

3. Complete OAuth consent screen verification
   - Required for public access
   - Google will review your app

## 💡 Additional Features Already Implemented:

- **Multiple auth providers ready**: The codebase supports Google, GitHub, Microsoft, LinkedIn, Facebook, Twitter (see `OAuthProvider.js`)
- **OAuth profile storage**: User's Google profile data is saved to database
- **Automatic username generation**: Creates unique username from email
- **Profile picture sync**: Google avatar automatically set
- **Verified email status**: Google-verified emails are marked as verified

## 📚 Relevant Files:

- **Frontend**: `client/components/GoogleLoginButton.jsx`
- **Backend Routes**: `server/routes/auth.js` (lines 575-713)
- **Auth Service**: `server/services/authService.js`
- **OAuth Model**: `server/models/OAuthProvider.js`
- **Login Page**: `client/pages/Login.jsx`
- **Register Page**: `client/pages/Register.jsx`

---

**Need help?** The Google OAuth is production-ready. Just add your credentials and test!
