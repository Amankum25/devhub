const mongoose = require('mongoose');

const customAIToolSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['code_analysis', 'text_processing', 'data_analysis', 'automation', 'custom'],
    index: true
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'processing', 'error', 'completed'],
    default: 'active',
    index: true
  },
  lastChecked: {
    type: Date,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'custom_ai_tools'
});

// Compound indexes for better query performance
customAIToolSchema.index({ userId: 1, type: 1 });
customAIToolSchema.index({ userId: 1, status: 1 });
customAIToolSchema.index({ userId: 1, createdAt: -1 });

// Instance methods
customAIToolSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.lastChecked = new Date();
  return this.save();
};

customAIToolSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static methods
customAIToolSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

customAIToolSchema.statics.findByUserAndType = function(userId, type) {
  return this.find({ userId, type }).sort({ createdAt: -1 });
};

customAIToolSchema.statics.findActiveByUser = function(userId) {
  return this.find({ userId, status: 'active' }).sort({ createdAt: -1 });
};

// Pre-save middleware
customAIToolSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'active') {
    this.lastChecked = new Date();
  }
  next();
});

const CustomAITool = mongoose.model('CustomAITool', customAIToolSchema);

module.exports = CustomAITool;
