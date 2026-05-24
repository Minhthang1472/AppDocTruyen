const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  novel: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
