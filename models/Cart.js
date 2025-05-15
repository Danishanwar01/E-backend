// backend/models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Userdata', required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:       { type: Number, default: 1 },
    size:      String,
    color:     String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
