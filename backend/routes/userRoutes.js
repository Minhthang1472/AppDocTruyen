const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('./authRoutes');

// Cập nhật lịch sử đọc
router.post('/history/add', verifyToken, async (req, res) => {
  try {
    const { novelId, chapterId } = req.body;
    const user = await User.findById(req.user.id);
    
    // Tìm truyện trong lịch sử
    const historyIndex = user.readingHistory.findIndex(h => h.novel.toString() === novelId);
    if (historyIndex !== -1) {
       user.readingHistory[historyIndex].lastChapter = chapterId;
       user.readingHistory[historyIndex].readAt = Date.now();
    } else {
       user.readingHistory.push({ novel: novelId, lastChapter: chapterId, readAt: Date.now() });
    }
    
    await user.save();
    res.json({ message: 'Đã lưu tiến độ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy lịch sử đọc
router.get('/history', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
       .populate({ path: 'readingHistory.novel', select: 'title coverImage genres' })
       .populate({ path: 'readingHistory.lastChapter', select: 'chapterNumber title' })
       .select('readingHistory');
       
    // Sort by newest
    const history = user.readingHistory.sort((a, b) => b.readAt - a.readAt);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= PROFILE =================

router.get('/profile/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      storiesRead: user.readingHistory.length,
      following: user.library.length,
      points: '15k'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (username) user.username = username;
    if (avatar) user.avatar = avatar; // assuming you added avatar field to User model earlier or it allows flexibility

    await user.save();
    
    // Return updated user without password
    const updatedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || 'https://via.placeholder.com/100'
    };
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LIBRARY / BOOKMARK =================

// Get library
router.get('/library', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('library');
    res.json(user.library);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle bookmark
router.post('/library/toggle', verifyToken, async (req, res) => {
  try {
    const { novelId } = req.body;
    const user = await User.findById(req.user.id);
    const index = user.library.indexOf(novelId);
    
    if (index > -1) {
      // Remove
      user.library.splice(index, 1);
      await user.save();
      res.json({ message: 'Đã xóa khỏi thư viện', isBookmarked: false });
    } else {
      // Add
      user.library.push(novelId);
      await user.save();
      res.json({ message: 'Đã thêm vào thư viện', isBookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
