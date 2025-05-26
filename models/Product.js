

// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  colors:      { type: [String], default: [] },
  sizes:       { type: [String], default: [] },

  // Cloudinary URLs और public IDs
  images:    { type: [String], required: true }, // ['https://res.cloudinary.com/.../abc.jpg', …]
  publicIds: { type: [String], required: true }, // ['mern_ecommerce_products/abc', …]

  category:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory:{
    id:   { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true }
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);








// // models/Product.js

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const productSchema = new Schema({
//   title:       { type: String, required: true, trim: true },
//   description: { type: String },
//   price:       { type: Number, required: true },
//   discount:    { type: Number, default: 0 },
//   colors:      [String],
//   sizes:       [String],
//   images:      [String],
 
//   category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

//   subcategory: {
//     id: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     }
//   }

// }, { timestamps: true });

// module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
