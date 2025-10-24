/**
 * Admin Sessions MongoDB Model
 * Records all admin sessions in the admin_sessions collection
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminSession extends Document {
  adminId: string;
  sessionId: string;
  loginAt: Date;
  logoutAt?: Date;
  ip: string;
  userAgent: string;
  origin?: string;
  createdAt: Date;
  isActive: boolean;
  lastActivity?: Date;
  duration?: number; // in milliseconds
}

const AdminSessionSchema = new Schema<IAdminSession>({
  adminId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  loginAt: {
    type: Date,
    required: true,
    index: true
  },
  logoutAt: {
    type: Date,
    index: true
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'admin_sessions'
});

// Indexes for better query performance
AdminSessionSchema.index({ adminId: 1, loginAt: -1 });
AdminSessionSchema.index({ sessionId: 1 });
AdminSessionSchema.index({ isActive: 1, lastActivity: -1 });
AdminSessionSchema.index({ loginAt: -1 });
AdminSessionSchema.index({ ip: 1, loginAt: -1 });

// Virtual for session duration
AdminSessionSchema.virtual('sessionDuration').get(function() {
  if (this.logoutAt) {
    return this.logoutAt.getTime() - this.loginAt.getTime();
  }
  return Date.now() - this.loginAt.getTime();
});

// Virtual for formatted dates
AdminSessionSchema.virtual('formattedLoginAt').get(function() {
  return this.loginAt.toISOString();
});

AdminSessionSchema.virtual('formattedLogoutAt').get(function() {
  return this.logoutAt ? this.logoutAt.toISOString() : null;
});

// Static method to get active sessions
AdminSessionSchema.statics.getActiveSessions = function(adminId?: string) {
  const query: any = { isActive: true };
  if (adminId) query.adminId = adminId;
  
  return this.find(query).sort({ lastActivity: -1 });
};

// Static method to get sessions by admin
AdminSessionSchema.statics.getByAdminId = function(adminId: string, limit: number = 50) {
  return this.find({ adminId })
    .sort({ loginAt: -1 })
    .limit(limit);
};

// Static method to get session by session ID
AdminSessionSchema.statics.getBySessionId = function(sessionId: string) {
  return this.findOne({ sessionId });
};

// Static method to get recent sessions
AdminSessionSchema.statics.getRecent = function(limit: number = 100) {
  return this.find()
    .sort({ loginAt: -1 })
    .limit(limit);
};

// Static method to get sessions by date range
AdminSessionSchema.statics.getByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    loginAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ loginAt: -1 });
};

// Static method to get admin session statistics
AdminSessionSchema.statics.getAdminSessionStats = function(adminId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        adminId,
        loginAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
        firstLogin: { $min: '$loginAt' },
        lastLogin: { $max: '$loginAt' },
        uniqueIPs: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        totalSessions: 1,
        activeSessions: 1,
        totalDuration: 1,
        avgDuration: 1,
        firstLogin: 1,
        lastLogin: 1,
        uniqueIPs: { $size: '$uniqueIPs' }
      }
    }
  ]);
};

// Static method to get session activity summary
AdminSessionSchema.statics.getSessionActivitySummary = function(adminId: string) {
  return this.aggregate([
    { $match: { adminId } },
    {
      $group: {
        _id: {
          year: { $year: '$loginAt' },
          month: { $month: '$loginAt' },
          day: { $dayOfMonth: '$loginAt' }
        },
        sessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
    }
  ]);
};

// Static method to get IP statistics
AdminSessionSchema.statics.getIPStats = function(adminId: string) {
  return this.aggregate([
    { $match: { adminId } },
    {
      $group: {
        _id: '$ip',
        sessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        lastLogin: { $max: '$loginAt' }
      }
    },
    {
      $sort: { sessions: -1 }
    }
  ]);
};

// Static method to get concurrent sessions
AdminSessionSchema.statics.getConcurrentSessions = function(adminId: string) {
  return this.aggregate([
    { $match: { adminId, isActive: true } },
    {
      $group: {
        _id: null,
        concurrentSessions: { $sum: 1 },
        sessions: { $push: '$$ROOT' }
      }
    }
  ]);
};

// Static method to cleanup expired sessions
AdminSessionSchema.statics.cleanupExpiredSessions = function(expiryHours: number = 24) {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() - expiryHours);
  
  return this.updateMany(
    {
      isActive: true,
      lastActivity: { $lt: expiryDate }
    },
    {
      $set: {
        isActive: false,
        logoutAt: new Date()
      }
    }
  );
};

// Instance method to end session
AdminSessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.logoutAt = new Date();
  this.duration = this.logoutAt.getTime() - this.loginAt.getTime();
  return this.save();
};

// Instance method to update activity
AdminSessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

export const AdminSession = mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);

export default AdminSession;
