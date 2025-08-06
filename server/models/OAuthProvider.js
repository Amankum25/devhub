const mongoose = require("mongoose");

const oAuthProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["google", "github", "microsoft", "linkedin", "facebook", "twitter"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    // Provider-specific data
    profile: {
      name: String,
      firstName: String,
      lastName: String,
      displayName: String,
      username: String,
      profileUrl: String,
      avatarUrl: String,
      bio: String,
      location: String,
      website: String,
      company: String,
      publicRepos: Number, // For GitHub
      followers: Number,
      following: Number,
    },
    // OAuth tokens (encrypted in production)
    tokens: {
      accessToken: String,
      refreshToken: String,
      tokenType: {
        type: String,
        default: "Bearer",
      },
      expiresAt: Date,
      scope: String,
    },
    // Provider-specific settings
    settings: {
      syncProfile: {
        type: Boolean,
        default: false,
      },
      syncAvatar: {
        type: Boolean,
        default: true,
      },
      publicProfile: {
        type: Boolean,
        default: false,
      },
      importContacts: {
        type: Boolean,
        default: false,
      },
    },
    // Connection metadata
    metadata: {
      connectedAt: {
        type: Date,
        default: Date.now,
      },
      lastSyncAt: Date,
      connectionCount: {
        type: Number,
        default: 1,
      },
      ipAddress: String,
      userAgent: String,
    },
    // Status and validation
    status: {
      type: String,
      enum: ["active", "inactive", "revoked", "expired"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    // Permissions granted by user
    permissions: [
      {
        scope: String,
        granted: Boolean,
        grantedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
oAuthProviderSchema.index({ user: 1 });
oAuthProviderSchema.index({ provider: 1, providerId: 1 }, { unique: true });
oAuthProviderSchema.index({ provider: 1, email: 1 });
oAuthProviderSchema.index({ status: 1 });
oAuthProviderSchema.index({ isPrimary: 1 });

// Pre-save middleware to ensure only one primary provider per type
oAuthProviderSchema.pre("save", async function (next) {
  if (this.isPrimary && this.isModified("isPrimary")) {
    // Remove primary status from other providers of the same type
    await this.constructor.updateMany(
      {
        user: this.user,
        provider: this.provider,
        _id: { $ne: this._id },
      },
      { isPrimary: false }
    );
  }
  next();
});

// Static method to find provider by external ID
oAuthProviderSchema.statics.findByProviderId = function (provider, providerId) {
  return this.findOne({ provider, providerId });
};

// Static method to get user's connected providers
oAuthProviderSchema.statics.getUserProviders = function (userId) {
  return this.find({ user: userId, status: "active" });
};

// Instance method to refresh token (implementation depends on provider)
oAuthProviderSchema.methods.refreshAccessToken = async function () {
  // This would be implemented based on each provider's OAuth flow
  throw new Error("refreshAccessToken must be implemented for each provider");
};

// Instance method to revoke connection
oAuthProviderSchema.methods.revoke = function () {
  this.status = "revoked";
  this.tokens.accessToken = null;
  this.tokens.refreshToken = null;
  return this.save();
};

// Instance method to sync profile data
oAuthProviderSchema.methods.syncProfile = async function () {
  if (!this.settings.syncProfile) {
    return false;
  }

  const User = mongoose.model("User");
  const user = await User.findById(this.user);

  if (!user) {
    return false;
  }

  // Update user profile with provider data
  const updates = {};
  
  if (this.profile.firstName && !user.firstName) {
    updates.firstName = this.profile.firstName;
  }
  
  if (this.profile.lastName && !user.lastName) {
    updates.lastName = this.profile.lastName;
  }
  
  if (this.settings.syncAvatar && this.profile.avatarUrl) {
    updates.avatar = this.profile.avatarUrl;
  }
  
  if (this.profile.bio && !user.bio) {
    updates.bio = this.profile.bio;
  }
  
  if (this.profile.location && !user.location) {
    updates.location = this.profile.location;
  }
  
  if (this.profile.website && !user.website) {
    updates.website = this.profile.website;
  }

  if (Object.keys(updates).length > 0) {
    await User.findByIdAndUpdate(this.user, updates);
    this.metadata.lastSyncAt = new Date();
    await this.save();
    return true;
  }

  return false;
};

module.exports = mongoose.model("OAuthProvider", oAuthProviderSchema);
