const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import utilities
const database = require("./config/database");
const logger = require("./utils/logger");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const chatRoutes = require("./routes/chat");
const aiRoutes = require("./routes/ai");
const geminiRoutes = require("./routes/gemini");
const snippetRoutes = require("./routes/snippets");
const uploadRoutes = require("./routes/uploads");
const adminRoutes = require("./routes/admin");

// Import middleware
const { authenticateToken } = require("./middleware/auth");
const { errorHandler } = require("./middleware/errorHandler");
const { validateRequest } = require("./middleware/validation");

const app = express();
const PORT = 3000; // Fixed to always use port 3000

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

app.use(limiter);

// Basic middleware
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Allow all localhost and 127.0.0.1 origins for development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      
      // Allow specific development ports
      const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
  }),
);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chat", authenticateToken, chatRoutes);
app.use("/api/ai", authenticateToken, aiRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/uploads", authenticateToken, uploadRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "DevHub API",
    version: "1.0.0",
    description: "AI-Powered Developer Hub API",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      posts: "/api/posts",
      comments: "/api/comments",
      chat: "/api/chat",
      ai: "/api/ai",
      snippets: "/api/snippets",
      uploads: "/api/uploads",
      admin: "/api/admin",
    },
    documentation: "/api/docs",
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    message: `The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "/api/auth",
      "/api/users",
      "/api/posts",
      "/api/comments",
      "/api/chat",
      "/api/ai",
      "/api/snippets",
      "/api/uploads",
      "/api/admin",
    ],
  });
});

// Serve static files from React build (production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit the process, just log the error for debugging
});

// Handle unhandled promise rejections

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process, just log the error for debugging
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    logger.info("MongoDB connected successfully");

    // Start server on fixed port
    const server = app.listen(PORT, () => {
      logger.info(`🚀 DevHub API Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🌐 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
      logger.info(
        `🍃 MongoDB Database: ${database.isConnected() ? "Connected" : "Disconnected"}`,
      );
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please run 'node cleanup-ports.js' first.`);
        process.exit(1);
      } else {
        throw err;
      }
    });

    return server;
  } catch (error) {
    logger.error("Failed to start server:", error);
    console.error(
      "MongoDB connection error. Please ensure MongoDB is running on mongodb://localhost:27017",
    );
    process.exit(1);
  }
}

const server = startServer();

module.exports = app;
