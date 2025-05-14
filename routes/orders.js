const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// Place a new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, shipping, totalAmount } = req.body;
    const order = await Order.create({ userId, items, shipping, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Could not place order' });
  }
});

// Get all orders for a user
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order
      .find({ userId: req.params.userId })
      .sort('-createdAt')
      .populate('items.productId', 'title price images'); // populate product title & image
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

module.exports = router;
