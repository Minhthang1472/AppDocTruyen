const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const Novel = require('./models/Novel');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novelportal').then(async () => {
  console.log('Connected to MongoDB');
  
  const res = await Novel.updateMany({}, { $set: { views: 0, followersCount: 0 } });
  console.log(`Reset successful. Modified ${res.modifiedCount} novels.`);
  
  mongoose.disconnect();
}).catch(err => {
  console.error(err);
  mongoose.disconnect();
});
