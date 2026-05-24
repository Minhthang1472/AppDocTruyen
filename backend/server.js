require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novelportal';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('NovelPortal API is running...');
});

// Import Routes
const novelRoutes = require('./routes/novelRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const { router: authRoutes } = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Routes
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
