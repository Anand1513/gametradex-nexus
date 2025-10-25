/**
 * Admin Actions MongoDB Model
 * Records all admin actions in the admin_actions collection
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAction extends Document {
  adminId: string;
  adminEmail: string;
  actorType: 'admin' | 'user';
  sessionId: string;
  actionType: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const AdminActionSchema = new Schema<IAdminAction>({
  adminId: {
    type: String,
    required: true,
    index: true
  },
  adminEmail: {
    type: String,
    required: true,
    index: true
  },
  actorType: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  actionType: {
    type: String,
    required: true,
    index: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'LISTING_APPROVE',
      'LISTING_REJECT',
      'LISTING_DELETE',
      'LISTING_EDIT',
      'PRICE_CHANGE',
      'USER_EDIT',
      'USER_ROLE_CHANGE',
      'ESCROW_UPDATE',
      'ESCROW_RELEASE',
      'ESCROW_REFUND',
      'PAYMENT_EDIT',
      'PAYMENT_PROCESS',
      'SECURITY_ACTION',
      'SYSTEM_UPDATE',
      'NOTIFICATION_CREATE',
      'NOTIFICATION_READ',
      'ADMIN_ACTION'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: [
      'SESSION',
      'LISTING',
      'USER',
      'ESCROW',
      'PAYMENT',
      'NOTIFICATION',
      'SYSTEM',
      'SECURITY'
    ]
  },
  targetId: {
    type: String,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
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
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'admin_actions'
});

// Indexes for better query performance
AdminActionSchema.index({ adminId: 1, createdAt: -1 });
AdminActionSchema.index({ actionType: 1, createdAt: -1 });
AdminActionSchema.index({ targetType: 1, targetId: 1 });
AdminActionSchema.index({ sessionId: 1, createdAt: -1 });
AdminActionSchema.index({ createdAt: -1 });

// Virtual for formatted date
AdminActionSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

// Static method to get admin actions by admin ID
AdminActionSchema.statics.getByAdminId = function(adminId: string, limit: number = 50) {
  return this.find({ adminId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get actions by type
AdminActionSchema.statics.getByActionType = function(actionType: string, limit: number = 50) {
  return this.find({ actionType })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get recent actions
AdminActionSchema.statics.getRecent = function(limit: number = 100) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get actions by date range
AdminActionSchema.statics.getByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Static method to get admin activity summary
AdminActionSchema.statics.getActivitySummary = function(adminId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        adminId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        lastAction: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get session activity
AdminActionSchema.statics.getSessionActivity = function(sessionId: string) {
  return this.find({ sessionId }).sort({ createdAt: 1 });
};

// Static method to get security actions
AdminActionSchema.statics.getSecurityActions = function(limit: number = 50) {
  return this.find({
    actionType: { $in: ['SECURITY_ACTION', 'LOGIN', 'LOGOUT'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get admin statistics
AdminActionSchema.statics.getAdminStats = function(adminId: string) {
  return this.aggregate([
    { $match: { adminId } },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
        actionTypes: { $addToSet: '$actionType' },
        firstAction: { $min: '$createdAt' },
        lastAction: { $max: '$createdAt' }
      }
    },
    {
      $project: {
        totalActions: 1,
        uniqueSessions: { $size: '$uniqueSessions' },
        actionTypes: { $size: '$actionTypes' },
        firstAction: 1,
        lastAction: 1
      }
    }
  ]);
};

export const AdminAction = mongoose.model<IAdminAction>('AdminAction', AdminActionSchema);

export default AdminAction;
