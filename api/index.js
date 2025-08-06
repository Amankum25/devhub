const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import database
const Database = require("../server/config/database");

// Import routes
const authRoutes = require("../server/routes/auth");
const userRoutes = require("../server/routes/users");
const postRoutes = require("../server/routes/posts");
const commentRoutes = require("../server/routes/comments");
const chatRoutes = require("../server/routes/chat");
const aiRoutes = require("../server/routes/ai");
const geminiRoutes = require("../server/routes/gemini");
const deepseekRoutes = require("../server/routes/deepseek");
const snippetRoutes = require("../server/routes/snippets");
const uploadRoutes = require("../server/routes/uploads");
const adminRoutes = require("../server/routes/admin");

// Import middleware
const { authenticateToken } = require("../server/middleware/auth");
const { errorHandler } = require("../server/middleware/errorHandler");
const { validateRequest } = require("../server/middleware/validation");

// Initialize database connection
const database = new Database();
let isDbConnected = false;

const app = express();

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
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "DevHub API is running"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/deepseek", deepseekRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Connect to database before handling requests
async function connectDatabase() {
  if (!isDbConnected) {
    try {
      await database.connect();
      isDbConnected = true;
      console.log("✅ Database connected for serverless function");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }
}

// Serverless function handler
module.exports = async (req, res) => {
  try {
    // Set CORS headers for all requests
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Ensure database is connected
    await connectDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed'
    });
  }
};
