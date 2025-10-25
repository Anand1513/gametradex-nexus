/**
 * Purchase MongoDB Model
 * Handles purchase transactions and delivery confirmations
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  _id: string;
  listingId: string;
  buyerId: string;
  buyerEmail: string;
  sellerId: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'delivered' | 'received' | 'completed' | 'disputed' | 'cancelled';
  paymentMethod: string;
  paymentId?: string;
  deliveryDetails: {
    method: 'email' | 'in-game' | 'direct' | 'other';
    instructions: string;
    deliveredAt?: Date;
    receivedAt?: Date;
  };
  dispute?: {
    reason: string;
    description: string;
    createdAt: Date;
    resolvedAt?: Date;
    resolution?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  };
}

const PurchaseSchema = new Schema<IPurchase>({
  listingId: {
    type: String,
    required: true,
    index: true
  },
  buyerId: {
    type: String,
    required: true,
    index: true
  },
  buyerEmail: {
    type: String,
    required: true,
    index: true
  },
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  sellerEmail: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'delivered', 'received', 'completed', 'disputed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'crypto', 'bank_transfer', 'other']
  },
  paymentId: {
    type: String,
    index: true
  },
  deliveryDetails: {
    method: {
      type: String,
      enum: ['email', 'in-game', 'direct', 'other'],
      required: true
    },
    instructions: {
      type: String,
      required: true,
      maxlength: 1000
    },
    deliveredAt: Date,
    receivedAt: Date
  },
  dispute: {
    reason: {
      type: String,
      enum: ['not_delivered', 'wrong_item', 'defective', 'fraud', 'other']
    },
    description: String,
    createdAt: Date,
    resolvedAt: Date,
    resolution: String
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    cancelledAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PurchaseSchema.index({ buyerId: 1 });
PurchaseSchema.index({ sellerId: 1 });
PurchaseSchema.index({ listingId: 1 });
PurchaseSchema.index({ status: 1 });
PurchaseSchema.index({ createdAt: -1 });
PurchaseSchema.index({ paymentId: 1 });

// Virtual for purchase duration
PurchaseSchema.virtual('duration').get(function() {
  if (this.metadata.completedAt) {
    return this.metadata.completedAt.getTime() - this.metadata.createdAt.getTime();
  }
  return Date.now() - this.metadata.createdAt.getTime();
});

// Virtual for days since purchase
PurchaseSchema.virtual('daysSincePurchase').get(function() {
  return Math.floor((Date.now() - this.metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Static methods
PurchaseSchema.statics.findByBuyer = function(buyerId: string) {
  return this.find({ buyerId }).sort({ createdAt: -1 });
};

PurchaseSchema.statics.findBySeller = function(sellerId: string) {
  return this.find({ sellerId }).sort({ createdAt: -1 });
};

PurchaseSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

PurchaseSchema.statics.findPending = function() {
  return this.find({ status: { $in: ['pending', 'paid', 'delivered'] } });
};

// Instance methods
PurchaseSchema.methods.markAsPaid = function(paymentId: string) {
  this.status = 'paid';
  this.paymentId = paymentId;
  return this.save();
};

PurchaseSchema.methods.confirmDelivery = function() {
  this.status = 'delivered';
  this.deliveryDetails.deliveredAt = new Date();
  return this.save();
};

PurchaseSchema.methods.confirmReceipt = function() {
  this.status = 'received';
  this.deliveryDetails.receivedAt = new Date();
  return this.save();
};

PurchaseSchema.methods.complete = function() {
  this.status = 'completed';
  this.metadata.completedAt = new Date();
  return this.save();
};

PurchaseSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.metadata.cancelledAt = new Date();
  return this.save();
};

PurchaseSchema.methods.createDispute = function(reason: string, description: string) {
  this.status = 'disputed';
  this.dispute = {
    reason,
    description,
    createdAt: new Date()
  };
  return this.save();
};

PurchaseSchema.methods.resolveDispute = function(resolution: string) {
  if (this.dispute) {
    this.dispute.resolvedAt = new Date();
    this.dispute.resolution = resolution;
  }
  return this.save();
};

export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
