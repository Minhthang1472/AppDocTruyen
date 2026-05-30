const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');
const User = require('../models/User');
const { verifyToken } = require('./authRoutes');
const jwt = require('jsonwebtoken');

// Middleware to parse token if present (but not block if absent)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
      if (!err) req.user = decoded;
      next();
    });
  } else {
    next();
  }
};

// Get all chapters for a novel
router.get('/novel/:novelId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chapters = await Chapter.find({ novel: req.params.novelId })
      .select('chapterNumber title views isVip coinsPrice createdAt')
      .sort({ chapterNumber: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Chapter.countDocuments({ novel: req.params.novelId });

    res.json({
      chapters,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalChapters: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific chapter content
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    // Check VIP logic
    let hasAccess = true;
    if (chapter.isVip) {
      hasAccess = false;
      if (req.user) {
        // Find user and check if unlocked
        const user = await User.findById(req.user.id);
        if (user && user.unlockedChapters && user.unlockedChapters.includes(chapter._id)) {
          hasAccess = true;
        }
        
        // Also allow access if the user is the uploader of the novel
        const novel = await Novel.findById(chapter.novel);
        if (novel && novel.uploader && novel.uploader.toString() === req.user.id) {
          hasAccess = true;
        }
      }
    }

    // Clone chapter object to return
    const responseData = chapter.toObject();

    if (!hasAccess) {
      responseData.content = 'THIS_IS_VIP_CONTENT'; // Flag for frontend to detect
      responseData.hasAccess = false;
    } else {
      responseData.hasAccess = true;
    }

    // Increment views
    chapter.views += 1;
    await chapter.save();

    if (hasAccess) {
       await Novel.findByIdAndUpdate(chapter.novel, { $inc: { views: 1 } });
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unlock a VIP chapter
router.post('/:id/unlock', verifyToken, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    if (!chapter.isVip) {
      return res.status(400).json({ message: 'Chương này không yêu cầu mở khóa' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if already unlocked
    if (user.unlockedChapters.includes(chapter._id)) {
      return res.status(400).json({ message: 'Bạn đã mở khóa chương này rồi' });
    }

    // Check balance
    if (user.coins < chapter.coinsPrice) {
      return res.status(400).json({ message: 'Số dư Coins không đủ để mở khóa' });
    }

    // Deduct coins and add to unlocked array
    user.coins -= chapter.coinsPrice;
    user.unlockedChapters.push(chapter._id);
    await user.save();

    res.json({ message: 'Mở khóa thành công', coinsLeft: user.coins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload a new chapter
router.post('/', verifyToken, async (req, res) => {
  try {
    const { novelId, chapterNumber, title, content, isVip, coinsPrice } = req.body;
    
    const novel = await Novel.findById(novelId);
    if (!novel) return res.status(404).json({ message: 'Truyện không tồn tại' });
    
    if (novel.uploader && novel.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm chương cho truyện này' });
    }

    const newChapter = new Chapter({
      novel: novelId,
      chapterNumber: Number(chapterNumber),
      title,
      content,
      isVip: isVip || false,
      coinsPrice: Number(coinsPrice) || 0
    });
    
    await newChapter.save();

    novel.chaptersCount += 1;
    await novel.save();

    res.status(201).json(newChapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Multer config for memory storage
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extract text from uploaded document
router.post('/extract-text', verifyToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file nào được tải lên.' });
    }

    const { originalname, buffer } = req.file;
    let extractedText = '';

    if (originalname.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (originalname.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: buffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ message: 'Định dạng file không được hỗ trợ. Chỉ hỗ trợ .pdf và .docx' });
    }

    // Clean up empty lines
    extractedText = extractedText.replace(/\n\s*\n/g, '\n\n').trim();

    res.json({ text: extractedText });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi trích xuất dữ liệu: ' + err.message });
  }
});

// Update a chapter
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chương không tồn tại' });
    
    const novel = await Novel.findById(chapter.novel);
    if (!novel) return res.status(404).json({ message: 'Truyện không tồn tại' });

    // Check permission (only uploader can edit)
    if (novel.uploader && novel.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa chương này' });
    }

    const { title, content, isVip, coinsPrice, chapterNumber } = req.body;
    if (title) chapter.title = title;
    if (content) chapter.content = content;
    if (isVip !== undefined) chapter.isVip = isVip;
    if (coinsPrice !== undefined) chapter.coinsPrice = Number(coinsPrice);
    if (chapterNumber !== undefined) chapter.chapterNumber = Number(chapterNumber);

    await chapter.save();
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a chapter
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chương không tồn tại' });

    const novel = await Novel.findById(chapter.novel);
    if (!novel) return res.status(404).json({ message: 'Truyện không tồn tại' });

    // Check permission (only uploader can delete)
    if (novel.uploader && novel.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa chương này' });
    }

    // Delete the chapter
    await Chapter.findByIdAndDelete(chapter._id);
    
    // Update novel chapter count
    if (novel.chaptersCount > 0) {
      novel.chaptersCount -= 1;
      await novel.save();
    }
    
    res.json({ message: 'Đã xóa chương thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
