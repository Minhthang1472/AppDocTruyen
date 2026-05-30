const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Ensure a user can only review a novel once
reviewSchema.index({ novel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
