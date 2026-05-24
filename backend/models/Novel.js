const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genres: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Ongoing', 'Completed', 'Hiatus'],
    default: 'Ongoing'
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  chaptersCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isEditorPick: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Novel', novelSchema);
