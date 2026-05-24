const mongoose = require('mongoose');
require('dotenv').config();
const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const pntt = await Novel.findOne({ title: 'Phàm Nhân Tu Tiên' });
  if (!pntt) {
    console.log('Novel not found');
    process.exit(1);
  }

  // Check if chapters already exist
  const existingCount = await Chapter.countDocuments({ novel: pntt._id });
  if (existingCount > 0) {
    console.log('Chapters already seeded for this novel.');
    process.exit(0);
  }

  const chapters = [];
  for (let i = 1; i <= 25; i++) {
    chapters.push({
      novel: pntt._id,
      chapterNumber: i,
      title: `Chương ${i}: Phàm nhân bước vào giang hồ`,
      content: 'Nội dung chương ' + i + '... Đây là nội dung mẫu để test phân trang.',
      coinsPrice: i > 15 ? 50 : 0,
      isVip: i > 15
    });
  }

  await Chapter.insertMany(chapters);
  console.log('Inserted 25 chapters for Phàm Nhân Tu Tiên');
  process.exit(0);
}).catch(err => {
  console.log(err);
  process.exit(1);
});
