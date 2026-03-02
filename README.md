# DevHub — AI-Powered Developer Platform

> A full-stack developer hub with AI tools, real-time chat, interview prep, and more.

?? **Live:** [https://devhub-eta.vercel.app](https://devhub-eta.vercel.app)
?? **Repo:** [https://github.com/Amankum25/devhub](https://github.com/Amankum25/devhub)

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38b2ac?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## Features

| Feature | Description |
|---|---|
| ?? **Auth** | JWT + Google OAuth login |
| ?? **Dashboard** | Activity stats, quick actions, overview |
| ?? **AI Tools** | Code explainer, bug fixer, project suggester, resume review |
| ?? **AI Interview Prep** | Company-specific mock interviews with Groq AI evaluation |
| ?? **Real-time Chat** | Multi-room messaging with Socket.io |
| ?? **Direct Messages** | Private 1-on-1 conversations |
| ?? **Profiles** | Skills, social links, activity history |
| ?? **Admin Panel** | User management, platform analytics |

---

## Tech Stack

**Frontend:** React 18 · Vite · React Router 6 · Tailwind CSS · Radix UI · Lucide
**Backend:** Node.js · Express · MongoDB (Atlas) · Mongoose · Socket.io
**AI:** Groq API (LLaMA 3)
**Auth:** JWT · Google OAuth2 · Passport.js
**Deployment:** Vercel (frontend) · Render (backend)

---

## Local Development

### Prerequisites

- Node.js v18+
- MongoDB Atlas URI (or local MongoDB)
- Groq API key ([console.groq.com](https://console.groq.com))

### Setup

```bash
# 1. Clone
git clone https://github.com/Amankum25/devhub.git
cd devhub

# 2. Install dependencies
npm install

# 3. Create .env in project root
cp .env.example .env   # then fill in values (see below)

# 4. Start dev server (frontend + backend on port 8080)
npm run dev
```

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devhub
JWT_SECRET=your_jwt_secret

# AI
GROQ_API_KEY=gsk_...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Frontend
VITE_API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8080
```

### Commands

```bash
npm run dev        # Start full dev environment (port 8080)
npm run build      # Production build
npm start          # Start production server
```

---

## Project Structure

```
client/              # React SPA (Vite, root: ./client)
+-- pages/           # Route components
+-- components/      # Shared UI components
+-- contexts/        # Auth context
+-- hooks/           # Custom hooks
+-- lib/             # API client, utils

server/              # Express API
+-- routes/          # API route handlers
+-- models/          # Mongoose models
+-- middleware/      # Auth, rate limiting
+-- services/        # Business logic
+-- data/            # Static data (interview questions, etc.)

shared/              # Shared types/interfaces
public/              # Static assets (served by Vite)
```

---

## API Overview

```
POST /api/auth/register          # Register
POST /api/auth/login             # Login (JWT)
GET  /api/auth/google            # Google OAuth

GET  /api/users                  # List users
GET  /api/users/:id              # User profile
PUT  /api/users/:id              # Update profile
POST /api/users/:id/follow       # Follow/unfollow

POST /api/ai/interact            # AI tool interaction
GET  /api/ai/history             # AI conversation history

GET  /api/interview/companies    # Available companies
POST /api/interview/start        # Start mock interview
POST /api/interview/chat         # Send answer, get AI response

GET  /api/chat/rooms             # Chat rooms
GET  /api/chat/rooms/:id/messages
POST /api/chat/rooms/:id/messages

GET  /api/admin/dashboard        # Admin stats (admin only)
GET  /api/admin/users            # User management (admin only)
```

---

## Deployment

The app is split across two services:

| Service | Platform | URL |
|---|---|---|
| Frontend (React/Vite) | Vercel | https://devhub-eta.vercel.app |
| Backend (Express/Socket.io) | Render | https://devhub-xzq7.onrender.com |

To redeploy manually:

```bash
git push origin main   # triggers Vercel auto-deploy
vercel --prod          # manual Vercel deploy
```

---

## License

MIT

---

**Built by [Aman Kumar](https://github.com/Amankum25)**
