// models/Order.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1) Sub‐schema for each tracking event
const TrackingEventSchema = new Schema({
  status: {
    type: String,
    enum: [
      "Order Placed",
      "Order Confirmed",
      "Shipped",
      "In Hub",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
      "Returned"
    ],
    required: true
  },
  message: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

const OrderSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'Userdata', required: true },
  items: [{
    productId:       { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:             { type: Number, required: true },
    size:            String,
    color:           String,
    reviewSubmitted: { type: Boolean, default: false }
  }],
  shipping: {
    name:       String,
    email:      String,
    address:    String,
    city:       String,
    country:    String,
    postalCode: String,
    contact:    String
  },
  totalAmount:   { type: Number, required: true },
  createdAt:     { type: Date, default: Date.now },

  // 2) Current overall order status
  status: {
    type: String,
    enum: [
      "Order Placed",
      "Order Confirmed",
      "Shipped",
      "In Hub",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
      "Returned"
    ],
    default: "Order Placed"
  },

  // 3) Optional courier/tracking fields
  courierPartner: { type: String, default: "" },
  trackingNumber: { type: String, default: "" },

  // 4) Array of tracking events
  tracking: [TrackingEventSchema]
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
