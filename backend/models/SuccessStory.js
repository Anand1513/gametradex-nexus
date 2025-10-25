const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  caption: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
successStorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('SuccessStory', successStorySchema);
