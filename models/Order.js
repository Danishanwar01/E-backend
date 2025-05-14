const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Userdata', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:       { type: Number, required: true },
    size:      String,
    color:     String
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
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
