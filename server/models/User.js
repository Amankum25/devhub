const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    website: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Website must be a valid URL",
      },
    },
    company: {
      type: String,
      maxlength: 100,
    },
    position: {
      type: String,
      maxlength: 100,
    },
    github: {
      type: String,
      maxlength: 50,
    },
    linkedin: {
      type: String,
      maxlength: 50,
    },
    twitter: {
      type: String,
      maxlength: 50,
    },
    skills: [
      {
        type: String,
        maxlength: 30,
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    picture: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Social profiles
    socialProfiles: {
      github: String,
      linkedin: String,
      twitter: String,
      portfolio: String,
    },
    // User preferences
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: false,
      },
      profileVisibility: {
        type: String,
        enum: ["public", "private", "friends"],
        default: "public",
      },
    },
    // API Keys
    deepseekApiKey: {
      type: String,
    },
    // Statistics
    stats: {
      postsCount: {
        type: Number,
        default: 0,
      },
      commentsCount: {
        type: Number,
        default: 0,
      },
      snippetsCount: {
        type: Number,
        default: 0,
      },
      followersCount: {
        type: Number,
        default: 0,
      },
      followingCount: {
        type: Number,
        default: 0,
      },
      reputation: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isAdmin: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate username if not provided
userSchema.pre("save", function (next) {
  if (!this.username) {
    this.username = `${this.firstName.toLowerCase()}${this.lastName.toLowerCase()}${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.isLocked) {
    await user.incLoginAttempts();
    throw new Error(
      "Account temporarily locked due to too many failed login attempts",
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error("Invalid credentials");
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login time
  user.lastLoginAt = new Date();
  await user.save();

  return user;
};

// Static method to get user stats
userSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
        verifiedUsers: {
          $sum: {
            $cond: [{ $eq: ["$emailVerified", true] }, 1, 0],
          },
        },
        adminUsers: {
          $sum: {
            $cond: [{ $eq: ["$isAdmin", true] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      adminUsers: 0,
    }
  );
};

// Static method to search users
userSchema.statics.search = async function (query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    includeInactive = false,
  } = options;

  const searchRegex = new RegExp(query, "i");
  const filter = {
    $and: [
      includeInactive ? {} : { isActive: true },
      {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { username: searchRegex },
          { email: searchRegex },
        ],
      },
    ],
  };

  const users = await this.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("-password");

  const total = await this.countDocuments(filter);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};

module.exports = mongoose.model("User", userSchema);
