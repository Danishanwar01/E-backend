// models/Product.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  price:       { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  colors:      [String],
  sizes:       [String],
  images:      [String],
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  subcategory: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  }

}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
