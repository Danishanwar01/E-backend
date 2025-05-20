// routes/review.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/products/:productId/reviews
router.post('/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, rating, comment, orderId, orderItemIndex } = req.body;

    // 1) Basic validation
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId." });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid orderId." });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId." });
    }
    if (typeof orderItemIndex !== 'number') {
      return res.status(400).json({ error: "orderItemIndex must be a number." });
    }

    // 2) Check that product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // 3) Check that order exists and belongs to this user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ error: "Order not found for this user." });
    }
    // Check order status
    if (order.status !== "Delivered") {
      return res.status(400).json({ error: "Cannot review before delivery." });
    }

    // 4) Validate orderItemIndex and reviewSubmitted flag
    if (!Array.isArray(order.items) ||
        orderItemIndex < 0 ||
        orderItemIndex >= order.items.length) {
      return res.status(400).json({ error: "Invalid orderItemIndex." });
    }
    if (order.items[orderItemIndex].reviewSubmitted) {
      return res.status(400).json({ error: "This item is already reviewed." });
    }

    // 5) Prevent duplicate review (composite unique index helps, but double-check)
    const existingReview = await Review.findOne({
      productId, userId, orderId, orderItemIndex
    });
    if (existingReview) {
      return res.status(400).json({ error: "Review already exists." });
    }

    // 6) Create Review document
    const review = await Review.create({
      productId,
      userId,
      orderId,
      orderItemIndex,
      rating,
      comment: comment || ""
    });

    // 7) Mark that order.items[orderItemIndex].reviewSubmitted = true
    order.items[orderItemIndex].reviewSubmitted = true;
    await order.save();

    // 8) Populate reviewer name before sending back
    await review.populate({ path: 'userId', select: 'name' });

    return res.status(201).json(review);

  } catch (err) {
    console.error("Error in POST /api/products/:productId/reviews:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// GET /api/products/:productId/reviews
router.get('/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId." });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort('-createdAt');

    return res.json(reviews);
  } catch (err) {
    console.error("Error in GET /api/products/:productId/reviews:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
