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
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  coins: {
    type: Number,
    default: 0
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
