const fs = require("fs");
const path = require("path");

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || "info";
    this.logFile =
      process.env.LOG_FILE || path.join(__dirname, "../logs/app.log");
    this.enableConsole = process.env.NODE_ENV !== "production";

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
  }

  writeToFile(formattedMessage) {
    try {
      fs.appendFileSync(this.logFile, formattedMessage + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    if (this.enableConsole) {
      const colors = {
        error: "\x1b[31m", // Red
        warn: "\x1b[33m", // Yellow
        info: "\x1b[36m", // Cyan
        debug: "\x1b[35m", // Magenta
      };
      const reset = "\x1b[0m";
      console.log(`${colors[level]}${formattedMessage}${reset}`);
    }

    this.writeToFile(formattedMessage);
  }

  error(message, meta = {}) {
    this.log("error", message, meta);
  }

  warn(message, meta = {}) {
    this.log("warn", message, meta);
  }

  info(message, meta = {}) {
    this.log("info", message, meta);
  }

  debug(message, meta = {}) {
    this.log("debug", message, meta);
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();

      res.on("finish", () => {
        const duration = Date.now() - start;
        const statusColor =
          res.statusCode >= 400
            ? "error"
            : res.statusCode >= 300
              ? "warn"
              : "info";

        this.log(statusColor, `${req.method} ${req.originalUrl}`, {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get("User-Agent"),
          ip: req.ip,
          userId: req.user?.id,
        });
      });

      next();
    };
  }

  // Error logging
  logError(error, context = {}) {
    this.error(error.message, {
      stack: error.stack,
      name: error.name,
      code: error.code,
      ...context,
    });
  }

  // Performance logging
  logPerformance(operation, duration, meta = {}) {
    const level = duration > 1000 ? "warn" : "info";
    this.log(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta,
    });
  }

  // Security logging
  logSecurity(event, details = {}) {
    this.warn(`Security Event: ${event}`, details);
  }

  // Database logging
  logDatabase(query, duration, error = null) {
    if (error) {
      this.error(`Database Error: ${query}`, {
        error: error.message,
        duration: `${duration}ms`,
      });
    } else if (duration > 1000) {
      this.warn(`Slow Query: ${query}`, {
        duration: `${duration}ms`,
      });
    } else if (this.logLevel === "debug") {
      this.debug(`Database Query: ${query}`, {
        duration: `${duration}ms`,
      });
    }
  }

  // Cleanup old logs
  cleanup(maxAge = 30) {
    const logDir = path.dirname(this.logFile);
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    try {
      const files = fs.readdirSync(logDir);
      const now = Date.now();

      files.forEach((file) => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAgeMs) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error("Failed to cleanup old logs", { error: error.message });
    }
  }
}

module.exports = new Logger();
