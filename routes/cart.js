// backend/routes/cart.js
const express = require('express');
const router  = express.Router();
const Cart    = require('../models/Cart');

// GET /api/cart/:userId  — fetch the user’s cart
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart ? cart.items : []);
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/cart/:userId  — replace the user’s cart with a new array of items
router.put('/:userId', async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { items },
      { upsert: true, new: true }
    );
    res.json(cart.items);
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
