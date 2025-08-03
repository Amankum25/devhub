const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['public', 'private', 'direct'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  settings: {
    isArchived: {
      type: Boolean,
      default: false
    },
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 1000
    }
  }
}, {
  timestamps: true
});

chatRoomSchema.index({ name: 1 });
chatRoomSchema.index({ type: 1 });
chatRoomSchema.index({ createdBy: 1 });
chatRoomSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
