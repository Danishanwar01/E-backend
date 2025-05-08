
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Product', productSchema);
