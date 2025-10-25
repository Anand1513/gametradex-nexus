/**
 * User MongoDB Model (JavaScript version)
 * Extended with roles and stats
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'seller', 'buyer'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    phone: String,
    country: String,
    timezone: String
  },
  stats: {
    listedCount: {
      type: Number,
      default: 0
    },
    boughtCount: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      },
      showStats: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'stats.listedCount': -1 });
UserSchema.index({ 'stats.boughtCount': -1 });
UserSchema.index({ 'stats.rating': -1 });

// Instance methods
UserSchema.methods.updateStats = function(type, amount) {
  if (type === 'list') {
    this.stats.listedCount += 1;
  } else if (type === 'buy') {
    this.stats.boughtCount += 1;
    if (amount) {
      this.stats.totalSpent += amount;
    }
  }
  return this.save();
};

UserSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.stats.rating * this.stats.reviewCount) + newRating;
  this.stats.reviewCount += 1;
  this.stats.rating = totalRating / this.stats.reviewCount;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
