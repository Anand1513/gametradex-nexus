/**
 * Purchase MongoDB Model (JavaScript version)
 * Handles purchase transactions and delivery confirmations
 */

const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
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

// Instance methods
PurchaseSchema.methods.markAsPaid = function(paymentId) {
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

PurchaseSchema.methods.createDispute = function(reason, description) {
  this.status = 'disputed';
  this.dispute = {
    reason,
    description,
    createdAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Purchase', PurchaseSchema);
