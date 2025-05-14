// backend/routes/userdata.js
const express = require('express');
const bcrypt  = require('bcrypt');
const User    = require('../models/Userdata');
const router  = express.Router();

// — Signup (with extra fields)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address, city, country, postalCode, phone } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hash,
      address, city, country, postalCode, phone
    });
    res.status(201).json({ message: 'User created successfully', id: user._id });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
});

// — Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ message: 'Invalid credentials' });
    if (!await bcrypt.compare(password, u.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({
      message: 'Login successful',
      user: {
        id:    u._id,
        name:  u.name,
        email: u.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// — Fetch Profile
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: err.message });
  }
});

// — Update Profile
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, select: '-password' }
    );
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
