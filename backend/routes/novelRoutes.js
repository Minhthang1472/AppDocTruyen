const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');

// Get all novels
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category === 'featured') query.isFeatured = true;
    else if (category === 'trending') query.isTrending = true;
    else if (category === 'editorPick') query.isEditorPick = true;
    else if (category && category !== 'All') query.genres = category;

    if (req.query.search) {
       query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    if (req.query.status && req.query.status !== 'All') {
       query.status = req.query.status;
    }

    let sortQuery = { views: -1 };
    if (req.query.sort === 'newest') sortQuery = { createdAt: -1 };
    else if (req.query.sort === 'rating') sortQuery = { rating: -1 };

    const novels = await Novel.find(query).sort(sortQuery);
    res.json(novels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single novel by ID
router.get('/:id', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) return res.status(404).json({ message: 'Novel not found' });
    res.json(novel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get popular novels
router.get('/popular/all', async (req, res) => {
  try {
    const novels = await Novel.find().sort({ views: -1 }).limit(10);
    res.json(novels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Comment = require('../models/Comment');
const { verifyToken } = require('./authRoutes');

// Get comments for a novel
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ novel: req.params.id })
                                  .populate('user', 'username avatar')
                                  .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const newComment = new Comment({
       novel: req.params.id,
       user: req.user.id,
       content: req.body.content
    });
    await newComment.save();
    
    // Return populated comment
    const populated = await Comment.findById(newComment._id).populate('user', 'username avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
