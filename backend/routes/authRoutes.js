const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'novelportal_secret_key';

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản hoặc Email đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: newUser._id, username, email, isPremium: newUser.isPremium } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Sai mật khẩu' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, isPremium: user.isPremium } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware xác thực token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Không có quyền truy cập' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token không hợp lệ' });
  }
};

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, verifyToken };
