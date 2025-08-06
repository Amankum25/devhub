const jwt = require("jsonwebtoken");
const database = require("../config/database");
const User = require("../models/User");
const UserSession = require("../models/UserSession");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "devhub-api",
    audience: "devhub-client",
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: "devhub-api",
    audience: "devhub-refresh",
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "devhub-api",
      audience: "devhub-client",
    });
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "devhub-api",
      audience: "devhub-refresh",
    });
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if session exists and is active
    const session = await UserSession.findOne({
      token: token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        error: "Access denied",
        message: "Invalid or expired session",
      });
    }

    // Get user details
    const user = await User.findById(decoded.userId).select(
      "email firstName lastName username avatar isAdmin isActive"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Access denied",
        message: "User not found or inactive",
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
    };
    req.sessionId = session._id;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Token expired",
      });
    }

    return res.status(500).json({
      error: "Authentication failed",
      message: "Internal server error",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);

    const session = await UserSession.findOne({
      token: token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.userId).select(
      "email firstName lastName username avatar isAdmin isActive"
    );

    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      };
      req.sessionId = session._id;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      error: "Access denied",
      message: "Admin privileges required",
    });
  }
  next();
};

// Rate limiting for auth endpoints
const authRateLimit = (maxAttempts = 5, windowMinutes = 15) => {
  const attempts = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    if (!attempts.has(ip)) {
      attempts.set(ip, []);
    }

    const userAttempts = attempts.get(ip);

    // Remove old attempts
    const recentAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < windowMs,
    );
    attempts.set(ip, recentAttempts);

    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        error: "Too many attempts",
        message: `Too many authentication attempts. Try again in ${windowMinutes} minutes.`,
        retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000),
      });
    }

    // Add current attempt
    recentAttempts.push(now);
    attempts.set(ip, recentAttempts);

    next();
  };
};

// Create session
const createSession = async (
  userId,
  token,
  refreshToken,
  userAgent,
  ipAddress,
) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionId = require('crypto').randomUUID();

  try {
    const session = new UserSession({
      user: userId,
      sessionId: sessionId,
      token: token,
      refreshToken: refreshToken,
      isActive: true,
      expiresAt: expiresAt,
      deviceInfo: {
        userAgent: userAgent,
      },
      networkInfo: {
        ipAddress: ipAddress,
      },
    });

    await session.save();
    return session._id;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
};

// Update last login
const updateLastLogin = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to update last login:", error);
  }
};

// Invalidate session
const invalidateSession = async (sessionId) => {
  try {
    await UserSession.findByIdAndUpdate(sessionId, {
      isActive: false,
    });
  } catch (error) {
    console.error("Failed to invalidate session:", error);
    throw error;
  }
};

// Cleanup expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const result = await UserSession.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false },
      ],
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
    }
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticateToken,
  optionalAuth,
  requireAdmin,
  authRateLimit,
  createSession,
  updateLastLogin,
  invalidateSession,
  cleanupExpiredSessions,
};
