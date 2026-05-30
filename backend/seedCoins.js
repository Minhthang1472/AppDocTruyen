const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appdoctruyen')
.then(async () => {
  console.log('Connected to MongoDB');
  const result = await User.updateMany(
    { coins: { $exists: false } },
    { $set: { coins: 500 } }
  );
  console.log(`Cập nhật thành công ${result.modifiedCount} user (Tặng 500 coins).`);
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
