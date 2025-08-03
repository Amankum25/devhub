# 🚀 DevHub AI - Complete Setup Guide for VS Code

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** - [Download here](https://code.visualstudio.com/)

## 🛠️ Step 1: Project Setup

### 1.1 Create Project Directory
```bash
mkdir devhub-ai
cd devhub-ai
```

### 1.2 Initialize Git Repository
```bash
git init
```

### 1.3 Copy All Project Files
Copy all the project files to your `devhub-ai` directory, maintaining the following structure:

```
devhub-ai/
├── client/
│   ├��─ components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── App.jsx
│   └── global.css
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.js
├── shared/
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── .env.example
```

## 🗄️ Step 2: MongoDB Setup

### 2.1 Install MongoDB

#### Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service
5. Install MongoDB Compass (optional GUI tool)

#### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Import MongoDB public GPG Key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org
```

### 2.2 Start MongoDB Service

#### Windows:
MongoDB should start automatically as a Windows service. If not:
```cmd
net start MongoDB
```

#### macOS:
```bash
brew services start mongodb-community
```

#### Linux:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2.3 Verify MongoDB Installation
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

## 📦 Step 3: Install Dependencies

### 3.1 Install All Dependencies
```bash
npm install
```

### 3.2 Install Additional MongoDB Dependencies
```bash
npm install mongoose slugify
```

## ⚙️ Step 4: Environment Configuration

### 4.1 Create Environment File
Copy the example environment file and customize it:

```bash
cp .env.example .env
```

### 4.2 Configure .env File
Edit the `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/devhub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50000000
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=2048

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=5

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_CLEANUP_INTERVAL=3600000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Development
DEBUG=devhub:*
ENABLE_CORS=true
TRUST_PROXY=false

# Production
ENABLE_COMPRESSION=true
ENABLE_HELMET=true
SECURE_COOKIES=false
```

## 🎨 Step 5: VS Code Setup

### 5.1 Install Recommended Extensions
Open VS Code and install these extensions:

```bash
# Open VS Code in project directory
code .
```

Install the following extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **MongoDB for VS Code**
- **Thunder Client** (for API testing)
- **Tailwind CSS IntelliSense**
- **JavaScript (ES6) code snippets**

### 5.2 Configure VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

### 5.3 Configure Launch Configuration
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/app.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Launch Client",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vite",
      "console": "integratedTerminal"
    }
  ],
  "compounds": [
    {
      "name": "Launch Full Stack",
      "configurations": ["Launch Server", "Launch Client"]
    }
  ]
}
```

### 5.4 Configure Tasks
Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Install Dependencies",
      "type": "shell",
      "command": "npm install",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Start Development",
      "type": "shell",
      "command": "npm run dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Build Production",
      "type": "shell",
      "command": "npm run build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## 🚀 Step 6: Running the Application

### 6.1 Start Development Environment
```bash
# Make sure MongoDB is running first
mongosh --eval "db.adminCommand('ismaster')"

# Install dependencies if not already done
npm install

# Start both frontend and backend
npm run dev
```

### 6.2 Alternative: Start Services Separately

#### Terminal 1 - Backend:
```bash
npm run server:dev
```

#### Terminal 2 - Frontend:
```bash
npm run client:dev
```

### 6.3 Verify Installation
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🔧 Step 7: Development Commands

### Essential Commands:
```bash
# Install dependencies
npm install

# Start development environment
npm run dev

# Start only backend
npm run server:dev

# Start only frontend
npm run client:dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### MongoDB Commands:
```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use devhub database
use devhub

# Show collections
show collections

# Find all users
db.users.find()

# Drop database (be careful!)
db.dropDatabase()
```

## 🛡️ Step 8: Default Admin Account

The application automatically creates a default admin account:

- **Email**: admin@devhub.com
- **Password**: admin123
- **Username**: admin

**Important**: Change the default admin password immediately after first login!

## 📁 Step 9: Project Structure

```
devhub-ai/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (buttons, inputs, etc.)
│   │   ├── Navigation.jsx  # Main navigation component
│   │   └── ...
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin panel pages
│   │   ├── Index.jsx      # Home page
│   │   ├── Login.jsx      # Authentication pages
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── App.jsx            # Main App component
│   └── global.css         # Global styles and animations
├── server/                # Backend Node.js application
│   ├── config/            # Configuration files
│   │   └── database.js    # MongoDB connection
│   ├── middleware/        # Express middleware
│   │   ├── auth.js        # Authentication middleware
│   │   ├── errorHandler.js # Error handling
│   │   └── validation.js  # Input validation
│   ├── models/            # MongoDB models
│   │   ├── User.js        # User model
│   │   ├── Post.js        # Blog post model
│   │   ├── Comment.js     # Comment model
│   │   └── ...
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── users.js       # User management
│   │   ├── posts.js       # Blog posts
│   │   └── ...
│   ├── utils/             # Utility functions
│   └── app.js             # Main server file
├── shared/                # Shared utilities between client/server
├── public/                # Static assets
├── uploads/               # File upload directory
├── logs/                  # Application logs
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
```

## 🎯 Step 10: Features Overview

### ✅ Completed Features:
- **User Authentication**: Registration, login, JWT tokens, sessions
- **Dashboard**: User statistics, quick actions, recent activity
- **Blog System**: Create, edit, view posts with rich content
- **AI Tools**: Code explanation, project suggestions, resume review
- **Chat System**: Real-time messaging with multiple rooms
- **Code Snippets**: Share and discover code snippets
- **User Profiles**: Complete profile management with skills and social links
- **Admin Panel**: User management, content moderation, analytics
- **Responsive Design**: Mobile-first, modern UI with animations
- **File Uploads**: Avatar and document upload system

### 🎨 UI Enhancements:
- **Modern Design**: Gradient backgrounds, glass effects, animations
- **Dark/Light Theme**: Toggle between themes
- **Smooth Animations**: Page transitions, hover effects, loading states
- **Mobile Responsive**: Optimized for all screen sizes
- **Beautiful Typography**: Custom fonts and text effects

## 🔧 Troubleshooting

### Common Issues:

#### 1. MongoDB Connection Error:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### 2. Port Already in Use:
```bash
# Kill process on port 3001
npx kill-port 3001

# Kill process on port 8080
npx kill-port 8080
```

#### 3. Node Modules Issues:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 4. Environment Variables Not Loading:
- Ensure `.env` file is in the root directory
- Check for typos in variable names
- Restart the development server

## 📚 Additional Resources

- **MongoDB Documentation**: https://docs.mongodb.com/
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://reactjs.org/docs/
- **Vite Documentation**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Mongoose ODM**: https://mongoosejs.com/docs/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding! 🚀**

For support or questions, please create an issue in the GitHub repository.
