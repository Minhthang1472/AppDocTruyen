const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');

// Get all chapters for a novel
router.get('/novel/:novelId', async (req, res) => {
  try {
    const chapters = await Chapter.find({ novel: req.params.novelId })
      .select('chapterNumber title views isVip coinsPrice createdAt')
      .sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific chapter content
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    // Increment views
    chapter.views += 1;
    await chapter.save();

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
