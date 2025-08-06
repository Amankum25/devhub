const mongoose = require("mongoose");

const userFollowSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "accepted", // For public profiles, auto-accept
    },
    // For notification preferences
    notifications: {
      newPosts: {
        type: Boolean,
        default: true,
      },
      newComments: {
        type: Boolean,
        default: false,
      },
      likes: {
        type: Boolean,
        default: false,
      },
    },
    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ["profile", "suggestion", "search", "mutual"],
        default: "profile",
      },
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique follow relationships
userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
userFollowSchema.index({ follower: 1 });
userFollowSchema.index({ following: 1 });
userFollowSchema.index({ status: 1 });
userFollowSchema.index({ createdAt: -1 });

// Validation to prevent self-following
userFollowSchema.pre("save", function (next) {
  if (this.follower.equals(this.following)) {
    const error = new Error("Users cannot follow themselves");
    error.status = 400;
    return next(error);
  }
  next();
});

// Post-save middleware to update user follower/following counts
userFollowSchema.post("save", async function () {
  const User = mongoose.model("User");
  
  // Update follower count for the user being followed
  const followingCount = await mongoose.model("UserFollow").countDocuments({
    following: this.following,
    status: "accepted",
  });
  
  // Update following count for the user who is following
  const followerCount = await mongoose.model("UserFollow").countDocuments({
    follower: this.follower,
    status: "accepted",
  });

  await User.findByIdAndUpdate(this.following, {
    "stats.followersCount": followingCount,
  });
  
  await User.findByIdAndUpdate(this.follower, {
    "stats.followingCount": followerCount,
  });
});

// Post-remove middleware to update user follower/following counts
userFollowSchema.post("remove", async function () {
  const User = mongoose.model("User");
  
  // Update follower count for the user being unfollowed
  const followingCount = await mongoose.model("UserFollow").countDocuments({
    following: this.following,
    status: "accepted",
  });
  
  // Update following count for the user who is unfollowing
  const followerCount = await mongoose.model("UserFollow").countDocuments({
    follower: this.follower,
    status: "accepted",
  });

  await User.findByIdAndUpdate(this.following, {
    "stats.followersCount": followingCount,
  });
  
  await User.findByIdAndUpdate(this.follower, {
    "stats.followingCount": followerCount,
  });
});

module.exports = mongoose.model("UserFollow", userFollowSchema);
