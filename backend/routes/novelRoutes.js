const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const { verifyToken } = require('./authRoutes');

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

// Upload a new novel
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, coverImage, genres } = req.body;
    
    // Tìm user để lấy username (vì token chỉ có id)
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const newNovel = new Novel({
      title,
      description,
      coverImage,
      genres,
      author: user.username, // Use uploader's username as author
      uploader: req.user.id
    });
    
    await newNovel.save();
    res.status(201).json(newNovel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's uploaded novels (Studio)
router.get('/studio/my-novels', verifyToken, async (req, res) => {
  try {
    const novels = await Novel.find({ uploader: req.user.id }).sort({ createdAt: -1 });
    res.json(novels);
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

// Rate a novel
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating, content } = req.body;
    const novelId = req.params.id;
    const userId = req.user.id;

    // Check if review already exists
    let review = await Review.findOne({ novel: novelId, user: userId });
    
    if (review) {
      return res.status(400).json({ message: 'Bạn đã đánh giá truyện này rồi.' });
    }

    // Create new review
    review = new Review({
      novel: novelId,
      user: userId,
      rating: Number(rating),
      content
    });
    await review.save();

    // Recalculate average rating
    const allReviews = await Review.find({ novel: novelId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    // Update novel
    const novel = await Novel.findById(novelId);
    novel.rating = Number(avgRating.toFixed(1));
    novel.ratingCount = allReviews.length;
    await novel.save();

    res.status(201).json({ message: 'Đánh giá thành công', novel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reviews for a novel
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ novel: req.params.id })
                                  .populate('user', 'username avatar')
                                  .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a novel
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) return res.status(404).json({ message: 'Truyện không tồn tại' });
    
    // Check permission (only uploader can edit)
    if (novel.uploader && novel.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa truyện này' });
    }

    const { title, description, coverImage, genres, status } = req.body;
    if (title) novel.title = title;
    if (description) novel.description = description;
    if (coverImage) novel.coverImage = coverImage;
    if (genres) novel.genres = genres;
    if (status) novel.status = status;

    await novel.save();
    res.json(novel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a novel (and all its chapters/comments/reviews)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) return res.status(404).json({ message: 'Truyện không tồn tại' });

    // Check permission (only uploader can delete)
    if (novel.uploader && novel.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa truyện này' });
    }

    // Delete associated data
    const Chapter = require('../models/Chapter');
    await Chapter.deleteMany({ novel: novel._id });
    await Comment.deleteMany({ novel: novel._id });
    await Review.deleteMany({ novel: novel._id });

    // Delete the novel itself
    await Novel.findByIdAndDelete(novel._id);
    
    res.json({ message: 'Đã xóa truyện thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
