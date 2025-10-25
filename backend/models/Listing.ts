/**
 * Listing MongoDB Model
 * Handles gaming account listings
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  _id: string;
  title: string;
  description: string;
  game: string;
  platform: string;
  accountLevel: number;
  rank: string;
  price: {
    min: number;
    max: number;
    isFixed: boolean;
    currency: string;
  };
  sellerId: string;
  sellerEmail: string;
  sellerContacts?: {
    discord?: string;
    telegram?: string;
    whatsapp?: string;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sold' | 'expired';
  isVerified: boolean;
  images: string[];
  tags: string[];
  requirements: {
    minAge?: number;
    region?: string;
    language?: string;
  };
  stats: {
    views: number;
    favorites: number;
    inquiries: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    approvedAt?: Date;
    soldAt?: Date;
    expiresAt?: Date;
  };
}

const ListingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  game: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile', 'Other']
  },
  accountLevel: {
    type: Number,
    required: true,
    min: 1
  },
  rank: {
    type: String,
    required: true,
    trim: true
  },
  price: {
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
    isFixed: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'USD'
    }
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
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'sold', 'expired'],
    default: 'pending',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requirements: {
    minAge: Number,
    region: String,
    language: String
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    }
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
    approvedAt: Date,
    soldAt: Date,
    expiresAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ListingSchema.index({ sellerId: 1 });
ListingSchema.index({ status: 1 });
ListingSchema.index({ game: 1 });
ListingSchema.index({ platform: 1 });
ListingSchema.index({ 'price.min': 1, 'price.max': 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ title: 'text', description: 'text' });

// Virtual for average price
ListingSchema.virtual('averagePrice').get(function() {
  return this.price.isFixed ? this.price.min : (this.price.min + this.price.max) / 2;
});

// Virtual for days since creation
ListingSchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((Date.now() - this.metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Static methods
ListingSchema.statics.findBySeller = function(sellerId: string) {
  return this.find({ sellerId }).sort({ createdAt: -1 });
};

ListingSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' }).sort({ createdAt: -1 });
};

ListingSchema.statics.findByGame = function(game: string) {
  return this.find({ game, status: 'approved' }).sort({ createdAt: -1 });
};

ListingSchema.statics.findByPriceRange = function(min: number, max: number) {
  return this.find({
    status: 'approved',
    'price.min': { $lte: max },
    'price.max': { $gte: min }
  }).sort({ createdAt: -1 });
};

// Instance methods
ListingSchema.methods.approve = function() {
  this.status = 'approved';
  this.metadata.approvedAt = new Date();
  return this.save();
};

ListingSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

ListingSchema.methods.markAsSold = function() {
  this.status = 'sold';
  this.metadata.soldAt = new Date();
  return this.save();
};

ListingSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

ListingSchema.methods.addToFavorites = function() {
  this.stats.favorites += 1;
  return this.save();
};

ListingSchema.methods.recordInquiry = function() {
  this.stats.inquiries += 1;
  return this.save();
};

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);
