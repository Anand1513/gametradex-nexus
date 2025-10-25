/**
 * User MongoDB Model
 * Extended with roles and stats
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin' | 'moderator' | 'seller' | 'buyer';
  isActive: boolean;
  isVerified: boolean;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    country?: string;
    timezone?: string;
  };
  stats: {
    listedCount: number;
    boughtCount: number;
    totalSpent: number;
    totalEarned: number;
    rating: number;
    reviewCount: number;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showStats: boolean;
    };
  };
  security: {
    lastLogin?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
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

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
});

// Virtual for account age
UserSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

UserSchema.statics.findByRole = function(role: string) {
  return this.find({ role });
};

UserSchema.statics.findTopSellers = function(limit: number = 10) {
  return this.find({ role: 'seller' })
    .sort({ 'stats.totalEarned': -1 })
    .limit(limit);
};

UserSchema.statics.findTopBuyers = function(limit: number = 10) {
  return this.find({ role: 'buyer' })
    .sort({ 'stats.totalSpent': -1 })
    .limit(limit);
};

// Instance methods
UserSchema.methods.updateStats = function(type: 'list' | 'buy', amount?: number) {
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

UserSchema.methods.updateRating = function(newRating: number) {
  const totalRating = (this.stats.rating * this.stats.reviewCount) + newRating;
  this.stats.reviewCount += 1;
  this.stats.rating = totalRating / this.stats.reviewCount;
  return this.save();
};

UserSchema.methods.isAccountLocked = function() {
  return !!(this.security.lockedUntil && this.security.lockedUntil > Date.now());
};

UserSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockedUntil && this.security.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockedUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates: any = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = { 'security.lockedUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'security.lockedUntil': 1, 'security.loginAttempts': 1 }
  });
};

export const User = mongoose.model<IUser>('User', UserSchema);
