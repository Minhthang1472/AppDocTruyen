const mongoose = require('mongoose');
require('dotenv').config();
const Novel = require('./models/Novel');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Novel.updateOne({title: 'Tiên Nghịch'}, {coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop'});
  await Novel.updateOne({title: 'Quang Âm Chi Ngoại'}, {coverImage: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=300&auto=format&fit=crop'});
  await Novel.updateOne({title: 'Phàm Nhân Tu Tiên'}, {coverImage: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=300&auto=format&fit=crop'});
  await Novel.updateOne({title: 'Ngã Dục Phong Thiên'}, {coverImage: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=300&auto=format&fit=crop'});
  await Novel.updateOne({title: 'Cầu Ma'}, {coverImage: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?q=80&w=300&auto=format&fit=crop'});
  console.log('Updated images');
  process.exit(0);
});
