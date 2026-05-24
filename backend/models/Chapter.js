const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  chapterNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isVip: {
    type: Boolean,
    default: false
  },
  coinsPrice: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
