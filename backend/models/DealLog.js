const mongoose = require('mongoose');

const dealLogSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by date
dealLogSchema.index({ date: -1 });

module.exports = mongoose.model('DealLog', dealLogSchema);
