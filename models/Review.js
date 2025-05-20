// models/Review.js

const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const reviewSchema = new Schema({
  productId: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: Types.ObjectId,
    ref: 'Userdata',
    required: true
  },
  orderId: {
    type: Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderItemIndex: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Composite unique index to prevent duplicate reviews on same order‑item by same user
reviewSchema.index({ productId: 1, userId: 1, orderId: 1, orderItemIndex: 1 }, { unique: true });

module.exports = mongoose.models.Review || model('Review', reviewSchema);
