
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const Category = require('../models/Category');
const Product  = require('../models/product');
const router  = express.Router();

// 1)  uploads directory 
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 2) multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // you can customize filename as you like
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 3)  upload middleware
const upload = multer({ storage });

// 4) POST /api/products
router.post('/', upload.array('images', 4), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount = 0,
      category: catId,
      subcategory: subId,
      colors,
      sizes
    } = req.body;

    // validate category
    const catDoc = await Category.findById(catId);
    if (!catDoc) return res.status(400).json({ message: 'Invalid category' });

    // find subcategory inside it
    const subDoc = catDoc.subcategories.id(subId);
    if (!subDoc) return res.status(400).json({ message: 'Subcategory not in this category' });

    // parse arrays
    const colorArr = Array.isArray(colors)
      ? colors
      : (colors ? colors.split(',').map(s => s.trim()) : []);
    const sizeArr = Array.isArray(sizes)
      ? sizes
      : (sizes ? sizes.split(',').map(s => s.trim()) : []);

    // build image paths
    const imagePaths = req.files.map(f => `/uploads/${f.filename}`);

    // create product
    const product = new Product({
      title,
      description,
      price:    Number(price),
      discount: Number(discount),
      colors:   colorArr,
      sizes:    sizeArr,
      images:   imagePaths,
      category: catId,
      subcategory: {
        id:   subDoc._id,
        name: subDoc.name
      }
    });

    const saved = await product.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// backend/routes/products.js
router.get('/', async (req, res) => {
  const { category, subcategory } = req.query;
  const filter = {};

  if (category)    filter.category              = category;
  if (subcategory) filter['subcategory.id']     = subcategory;

  // now only matching docs will be returned
  const products = await Product
    .find(filter)
    .populate('category', 'name');
  res.json(products);
});



module.exports = router;
