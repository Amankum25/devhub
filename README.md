# 🚀 DevHub AI - AI-Powered Developer Hub

A modern, full-stack developer community platform with AI-powered tools, real-time chat, code snippets sharing, and beautiful responsive UI.

![DevHub AI](https://img.shields.io/badge/DevHub-AI--Powered-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38b2ac?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Core Features

- **🔐 User Authentication** - Secure JWT-based authentication with sessions
- **📊 Interactive Dashboard** - User statistics, activity tracking, and quick actions
- **📝 Blog System** - Rich content creation with markdown support
- **🤖 AI Tools** - Code explanation, project suggestions, resume review
- **💬 Real-time Chat** - Multi-room messaging system with online presence
- **📚 Code Snippets** - Share and discover code snippets with syntax highlighting
- **👤 User Profiles** - Complete profile management with skills and social links
- **⚡ Admin Panel** - Comprehensive platform management and analytics

### 🎨 UI/UX Features

- **🌙 Dark/Light Theme** - Toggle between beautiful themes
- **📱 Responsive Design** - Mobile-first, optimized for all devices
- **✨ Modern Animations** - Smooth transitions and micro-interactions
- **🎭 Glass Effects** - Modern glassmorphism design elements
- **🌈 Gradient Animations** - Dynamic background animations
- **🎪 Interactive Components** - Hover effects and loading states

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB (v5.0+)
- Git

### 1. Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd devhub-ai

# Install dependencies
npm install
```

### 2. Start MongoDB

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# Minimum required:
# MONGODB_URI=mongodb://localhost:27017/devhub
# JWT_SECRET=your-secret-key-here
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server:dev  # Backend only
npm run client:dev  # Frontend only
```

### 5. Access Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Admin Panel**: http://localhost:8080/admin

### 6. Default Admin Login

- **Email**: admin@devhub.com
- **Password**: admin123

## 📦 Commands Reference

### Development

```bash
npm run dev              # Start full development environment
npm run server:dev       # Start backend only
npm run client:dev       # Start frontend only
npm run build            # Build for production
npm run start            # Start production server
```

### Code Quality

```bash
npm run lint             # Check code style
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm test                 # Run tests
```

### Database

```bash
# MongoDB shell commands
mongosh                  # Connect to MongoDB
use devhub              # Switch to devhub database
show collections        # Show all collections
db.users.find()         # List all users
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh tokens
- **Styling**: Tailwind CSS + Custom animations
- **Icons**: Lucide React
- **UI Components**: Radix UI + Custom components

### Project Structure

```
devhub-ai/
├── client/              # React frontend
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilities
├── server/             # Express backend
│   ├── config/         # Configuration
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── utils/          # Utilities
├── shared/             # Shared code
└── public/             # Static assets
```

## 🎨 UI Components

### Enhanced Components

- **Navigation** - Responsive navbar with user menu
- **Dashboard Cards** - Statistics and quick actions
- **Blog Editor** - Rich text editor with preview
- **Chat Interface** - Real-time messaging UI
- **Profile Management** - Complete user profile forms
- **Admin Tables** - Data management interfaces
- **Loading States** - Beautiful loading animations
- **Error Boundaries** - Graceful error handling

### Design System

- **Colors**: Blue/Purple gradients with semantic colors
- **Typography**: Inter font family with custom weights
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design approach

## 🔐 Authentication

### Features

- User registration with email verification
- Secure login with JWT tokens
- Refresh token rotation
- Session management
- Password reset functionality
- Account lockout protection
- Admin role management

### API Endpoints

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/refresh     # Refresh tokens
POST /api/auth/logout      # User logout
GET  /api/auth/me          # Get current user
```

## 📊 API Documentation

### Core Endpoints

```
# Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

# Users
GET  /api/users
GET  /api/users/:id
PUT  /api/users/:id
POST /api/users/:id/follow

# Posts
GET  /api/posts
GET  /api/posts/:id
POST /api/posts
PUT  /api/posts/:id
DELETE /api/posts/:id

# Comments
GET  /api/comments/post/:postId
POST /api/comments
PUT  /api/comments/:id
DELETE /api/comments/:id

# Chat
GET  /api/chat/rooms
GET  /api/chat/rooms/:id/messages
POST /api/chat/rooms/:id/messages

# AI Tools
POST /api/ai/interact
GET  /api/ai/history
GET  /api/ai/stats

# Admin
GET  /api/admin/dashboard
GET  /api/admin/users
GET  /api/admin/posts
```

## 🎯 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=your-production-frontend-url
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Setup Guide](SETUP_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/devhub-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/devhub-ai/discussions)

## 🙏 Acknowledgments

- **React Team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database
- **Radix UI** for accessible UI components
- **Lucide** for the beautiful icons

---

**Made with ❤️ by the DevHub Team**

For support, please open an issue or join our community discussions.
