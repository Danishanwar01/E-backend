// routes/order.js
const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const User    = require('../models/Userdata');

// ------------------------------------------------------------
// 1) Place a new order (as before)
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { userId, items, shipping, totalAmount } = req.body;
    const order = await Order.create({ userId, items, shipping, totalAmount });

    // Optional: initialize the first tracking event immediately upon creation
    order.tracking.push({
      status: "Order Placed",
      message: "Your order has been placed.",
      timestamp: new Date()
    });
    await order.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Could not place order' });
  }
});

// ------------------------------------------------------------
// 2) Get all orders for a specific user (as before)
// ------------------------------------------------------------
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order
      .find({ userId: req.params.userId })
      .sort('-createdAt')
      .populate('items.productId', 'title price images discount category subcategory');
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// ------------------------------------------------------------
// 3) Get all orders for ADMIN
//    (so your admin UI can list everything, including user data)
// ------------------------------------------------------------
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order
      .find()
      .sort('-createdAt')
      // Populate user info so the admin can see user.email or user.name
      .populate('userId', 'name email')
      // Also populate each item's productId with title, price, images, discount, category, subcategory
      .populate('items.productId', 'title price images discount category subcategory');
    res.json(orders);
  } catch (err) {
    console.error('Fetch all orders (admin) error:', err);
    res.status(500).json({ error: 'Could not fetch all orders' });
  }
});

// ------------------------------------------------------------
// 4) Add a new tracking event (and update top‑level status, courier fields)
//    PUT /api/orders/:orderId/tracking
// ------------------------------------------------------------
router.put('/:orderId/tracking', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message, timestamp, courierPartner, trackingNumber } = req.body;

    console.log("Received tracking update:", req.body);

    if (!status) {
      console.warn("Missing status field");
      return res.status(400).json({ error: "status is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn("Order not found:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    order.tracking.push({
      status,
      message: message || "",
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    order.status = status;
    if (courierPartner !== undefined) order.courierPartner = courierPartner;
    if (trackingNumber !== undefined)  order.trackingNumber = trackingNumber;

    await order.save();

    await order.populate([
      { path: 'userId', select: 'name email' },
      { path: 'items.productId', select: 'title price images discount category subcategory' }
    ]);

    return res.json(order);
  } catch (err) {
    console.error("Add tracking event error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// routes/order.js 
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order
      .find({ userId: req.params.userId })
      .sort('-createdAt')
      .populate('items.productId', 'title price images discount category subcategory');
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});


module.exports = router;
