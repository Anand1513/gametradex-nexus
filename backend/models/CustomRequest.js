/**
 * Custom Request Model
 * Handles custom account requests with advance payment verification
 */

const mongoose = require('mongoose');

const CustomRequestSchema = new mongoose.Schema({
  // User information
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Request details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  game: {
    type: String,
    required: true,
    trim: true,
    enum: ['BGMI', 'PUBG', 'Free Fire', 'Valorant', 'Fortnite', 'Other']
  },
  
  budget: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    }
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Payment and status
  advancePaid: {
    type: Boolean,
    default: false,
    required: true
  },
  
  customRequestId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending_payment', 'processing', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending_payment',
    required: true,
    index: true
  },
  
  // Payment details
  paymentDetails: {
    amount: {
      type: Number,
      required: function() {
        return this.advancePaid;
      }
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet'],
      required: function() {
        return this.advancePaid;
      }
    },
    transactionId: {
      type: String,
      required: function() {
        return this.advancePaid;
      }
    },
    paymentDate: {
      type: Date,
      required: function() {
        return this.advancePaid;
      }
    }
  },
  
  // Additional requirements
  requirements: {
    minimumLevel: {
      type: Number,
      min: 1
    },
    minimumCollectionLevel: {
      type: Number,
      min: 0
    },
    platform: {
      type: String,
      enum: ['Facebook', 'Google', 'Twitter', 'Apple', 'Any'],
      default: 'Any'
    },
    specificFeatures: [{
      type: String,
      trim: true
    }]
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    default: function() {
      // Expires in 7 days from creation
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    },
    index: true
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Fulfillment details
  fulfillmentDetails: {
    matchedListings: [{
      listingId: String,
      title: String,
      price: Number,
      matchedAt: Date
    }],
    selectedListing: {
      listingId: String,
      title: String,
      price: Number,
      selectedAt: Date
    },
    completedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
CustomRequestSchema.index({ userId: 1, status: 1 });
CustomRequestSchema.index({ status: 1, createdAt: -1 });
CustomRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Pre-save middleware to generate customRequestId
CustomRequestSchema.pre('save', function(next) {
  if (this.isModified('advancePaid') && this.advancePaid && !this.customRequestId) {
    // Generate custom request ID only after payment is confirmed
    this.customRequestId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  
  // Update the updatedAt field
  this.updatedAt = new Date();
  
  next();
});

// Static methods
CustomRequestSchema.statics.findByUserId = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

CustomRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

CustomRequestSchema.statics.findExpired = function() {
  return this.find({
    status: 'pending_payment',
    expiresAt: { $lt: new Date() }
  });
};

CustomRequestSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget.max' }
      }
    }
  ]);
};

// Instance methods
CustomRequestSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this.save();
};

CustomRequestSchema.methods.markAsFulfilled = function(selectedListing) {
  this.status = 'fulfilled';
  this.fulfillmentDetails.selectedListing = selectedListing;
  this.fulfillmentDetails.completedAt = new Date();
  return this.save();
};

CustomRequestSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

CustomRequestSchema.methods.expire = function() {
  this.status = 'expired';
  return this.save();
};

// Virtual for formatted budget
CustomRequestSchema.virtual('formattedBudget').get(function() {
  return `${this.budget.currency} ${this.budget.min.toLocaleString()} - ${this.budget.max.toLocaleString()}`;
});

// Virtual for time remaining
CustomRequestSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h`;
});

// Ensure virtual fields are serialized
CustomRequestSchema.set('toJSON', { virtuals: true });
CustomRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CustomRequest', CustomRequestSchema);
