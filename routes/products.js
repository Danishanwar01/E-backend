// backend/routes/products.js

const express   = require('express');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const Category  = require('../models/Category');
const Product   = require('../models/Product');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────
// 1) Ensure the uploads directory exists
// ─────────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────
// 2) Configure Multer for image uploads
// ─────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });


// ─────────────────────────────────────────────────────────────────
// 3) POST /api/products
//    Create a new product (up to 4 images).
// ─────────────────────────────────────────────────────────────────
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

    // 3.1) Validate category exists
    const catDoc = await Category.findById(catId);
    if (!catDoc) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    // 3.2) Validate subcategory belongs to that category
    const subDoc = catDoc.subcategories.id(subId);
    if (!subDoc) {
      return res.status(400).json({ message: 'Subcategory not found in this category.' });
    }

    // 3.3) Parse colors & sizes into arrays if sent as comma-separated strings
    const colorArr = Array.isArray(colors)
      ? colors
      : (colors ? colors.split(',').map(s => s.trim()) : []);
    const sizeArr = Array.isArray(sizes)
      ? sizes
      : (sizes ? sizes.split(',').map(s => s.trim()) : []);

    // 3.4) Save uploaded file paths (relative to /uploads)
    const imagePaths = (req.files || []).map(f => `/uploads/${f.filename}`);

    // 3.5) Build and save the new Product document
    const product = new Product({
      title,
      description,
      price: Number(price),
      discount: Number(discount),
      colors: colorArr,
      sizes: sizeArr,
      images: imagePaths,
      category: catId,
      subcategory: {
        id:   subDoc._id,
        name: subDoc.name
      }
    });

    const savedProduct = await product.save();
    return res.status(201).json(savedProduct);

  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────
// 4) GET /api/products
//    Fetch all products. Supports optional query filters:
//      • /api/products?category=<catId>
//      • /api/products?subcategory=<subId>
// ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (subcategory) {
      filter['subcategory.id'] = subcategory;
    }

    const products = await Product
      .find(filter)
      .populate('category', 'name');

    return res.json(products);

  } catch (err) {
    console.error('GET /api/products error:', err);
    return res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────
// 5) GET /api/products/:id
//    Fetch a single product by its ID.
// ─────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const prod = await Product
      .findById(req.params.id)
      .populate('category', 'name');

    if (!prod) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(prod);

  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    return res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────
// 6) PUT /api/products/:id
//    Update an existing product’s fields. Does NOT handle new image uploads.
//    (If you need to add/edit images, create a separate route with Multer.)
// ─────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    // (Optional) If category/subcategory might change, you can re-validate here.

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(updatedProduct);

  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    return res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────
// 7) DELETE /api/products/:id
//    Delete a product by ID. Also unlinks any images on disk.
// ─────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    // 7.1) Find the product
    const prodToDelete = await Product.findById(req.params.id);
    if (!prodToDelete) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // 7.2) If there are saved images, remove them from disk
    if (Array.isArray(prodToDelete.images)) {
      prodToDelete.images.forEach(imgPath => {
        // imgPath is like "/uploads/<filename>"
        const fullPath = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, unlinkErr => {
            if (unlinkErr) console.error('Failed to delete image file:', unlinkErr);
          });
        }
      });
    }

    // 7.3) Delete the product document
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Product deleted successfully.' });

  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    return res.status(500).json({ message: err.message });
  }
});


module.exports = router;
