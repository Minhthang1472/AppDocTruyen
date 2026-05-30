const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  coins: {
    type: Number,
    default: 500
  },
  unlockedChapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bio: {
    type: String,
    default: 'Chưa có tiểu sử.'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  readingHistory: [{
    novel: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel' },
    lastChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    readAt: { type: Date, default: Date.now }
  }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Novel' }],
  library: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Novel' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
