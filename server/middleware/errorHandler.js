const logger = require("../utils/logger");

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle different error types
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, "CAST_ERROR");
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400, "DUPLICATE_FIELD");
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400, "VALIDATION_ERROR");
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401, "INVALID_TOKEN");

const handleJWTExpiredError = () =>
  new AppError(
    "Your token has expired! Please log in again.",
    401,
    "EXPIRED_TOKEN",
  );

// Send error in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code,
  });
};

// Send error in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
      code: "INTERNAL_ERROR",
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    // SQLite specific errors
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      error = new AppError(
        "Duplicate value for unique field",
        400,
        "DUPLICATE_VALUE",
      );
    }
    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      error = new AppError(
        "Invalid reference to related data",
        400,
        "FOREIGN_KEY_ERROR",
      );
    }

    sendErrorProd(error, res);
  }
};

// 404 handler
const notFound = (req, res, next) => {
  const err = new AppError(`Not Found - ${req.originalUrl}`, 404, "NOT_FOUND");
  next(err);
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation error creator
const createValidationError = (message, field = null) => {
  return new AppError(
    message,
    400,
    field ? `VALIDATION_${field.toUpperCase()}` : "VALIDATION_ERROR",
  );
};

// Database error handler
const handleDatabaseError = (error, operation = "database operation") => {
  console.error(`Database error during ${operation}:`, error);

  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return new AppError("This value already exists", 409, "DUPLICATE_VALUE");
  }

  if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    return new AppError(
      "Invalid reference to related data",
      400,
      "FOREIGN_KEY_ERROR",
    );
  }

  if (error.code === "SQLITE_CONSTRAINT_NOTNULL") {
    return new AppError(
      "Required field is missing",
      400,
      "MISSING_REQUIRED_FIELD",
    );
  }

  return new AppError(`Failed to perform ${operation}`, 500, "DATABASE_ERROR");
};

// Rate limit error handler
const handleRateLimitError = (req, res) => {
  return res.status(429).json({
    status: "error",
    message: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: 900, // 15 minutes
  });
};

// File upload error handler
const handleUploadError = (error) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new AppError("File too large", 413, "FILE_TOO_LARGE");
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return new AppError("Too many files", 413, "TOO_MANY_FILES");
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return new AppError("Unexpected file field", 400, "UNEXPECTED_FILE");
  }

  return new AppError("Upload failed", 500, "UPLOAD_ERROR");
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  catchAsync,
  createValidationError,
  handleDatabaseError,
  handleRateLimitError,
  handleUploadError,
};
