const mongoose = require('mongoose');

const InterestSchema = new mongoose.Schema({
  listingId: { 
    type: String, 
    required: true, 
    trim: true 
  },
  userId: { 
    type: String, 
    required: true, 
    trim: true 
  },
  userEmail: { 
    type: String, 
    required: true, 
    trim: true 
  },
  userName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  listingTitle: { 
    type: String, 
    required: true, 
    trim: true 
  },
  listingPrice: { 
    type: String, 
    required: true, 
    trim: true 
  },
  timestamp: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'contacted', 'closed'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

// Index for efficient querying
InterestSchema.index({ listingId: 1, userId: 1 });
InterestSchema.index({ timestamp: -1 });
InterestSchema.index({ status: 1 });

module.exports = mongoose.model('Interest', InterestSchema);
