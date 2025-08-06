const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    // Device and browser information
    deviceInfo: {
      userAgent: String,
      browser: String,
      os: String,
      device: String,
      platform: String,
    },
    // Network information
    networkInfo: {
      ipAddress: String,
      country: String,
      city: String,
      timezone: String,
    },
    // Session activity
    activity: {
      lastActiveAt: {
        type: Date,
        default: Date.now,
      },
      pageViews: {
        type: Number,
        default: 0,
      },
      actionsCount: {
        type: Number,
        default: 0,
      },
    },
    // Security flags
    security: {
      isSuspicious: {
        type: Boolean,
        default: false,
      },
      riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      flags: [String], // Array of security flags
    },
    // Session metadata
    metadata: {
      loginMethod: {
        type: String,
        enum: ["password", "google", "github", "magic-link"],
        default: "password",
      },
      rememberMe: {
        type: Boolean,
        default: false,
      },
      source: {
        type: String,
        enum: ["web", "mobile", "desktop", "api"],
        default: "web",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSessionSchema.index({ user: 1 });
userSessionSchema.index({ sessionId: 1 });
userSessionSchema.index({ refreshToken: 1 });
userSessionSchema.index({ isActive: 1 });
userSessionSchema.index({ expiresAt: 1 });
userSessionSchema.index({ "activity.lastActiveAt": -1 });
userSessionSchema.index({ createdAt: -1 });

// TTL index to automatically remove expired sessions
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to update last active time
userSessionSchema.pre("save", function (next) {
  if (this.isModified("activity")) {
    this.activity.lastActiveAt = new Date();
  }
  next();
});

// Static method to cleanup expired sessions
userSessionSchema.statics.cleanupExpiredSessions = async function () {
  const now = new Date();
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: now } },
      { isActive: false },
    ],
  });
  return result.deletedCount;
};

// Static method to invalidate user sessions
userSessionSchema.statics.invalidateUserSessions = async function (userId, excludeSessionId = null) {
  const query = { user: userId };
  if (excludeSessionId) {
    query.sessionId = { $ne: excludeSessionId };
  }
  
  const result = await this.updateMany(query, { isActive: false });
  return result.modifiedCount;
};

// Instance method to extend session
userSessionSchema.methods.extend = function (additionalTime = 24 * 60 * 60 * 1000) { // 24 hours default
  this.expiresAt = new Date(Date.now() + additionalTime);
  this.activity.lastActiveAt = new Date();
  return this.save();
};

module.exports = mongoose.model("UserSession", userSessionSchema);
