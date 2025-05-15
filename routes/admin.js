const express = require('express');
const router  = express.Router();
const User    = require('../models/Userdata');
const Cart    = require('../models/Cart');
const Order   = require('../models/Order');

// — LIST ALL USERS —
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// — LIST ALL CARTS — with full product details
router.get('/carts', async (req, res) => {
  const carts = await Cart.find()
    // 1) bring in user name & email
    .populate('userId', 'name email')
    // 2) deep‑populate each item’s product with images, category, subcategory
    .populate({
      path: 'items.productId',
      select: 'title price discount images category subcategory',
      populate: [
        { path: 'category',    select: 'name' },
        { path: 'subcategory', select: 'name' }
      ]
    });

  res.json(carts);
});

router.get('/orders', async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
  .populate({
  path: 'items.productId',
  select: 'title price discount images category subcategory',
  populate: [
    { path: 'category', select: 'name' },
    { path: 'subcategory', select: 'name' }
  ]
});

  res.json(orders);
});

module.exports = router;
