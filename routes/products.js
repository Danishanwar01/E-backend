
// backend/routes/products.js
const express   = require('express');
const multer    = require('multer');
const Category  = require('../models/Category');
const Product   = require('../models/Product');
const { storage, cloudinary } = require('../config/cloudinaryConfig');
const router    = express.Router();

// पहले वाली diskStorage वाली ज़रूरत पूरी तरह से खत्म हो गई।
//
// const path    = require('path');
// const fs      = require('fs');
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }
// const storageDisk = multer.diskStorage({
//   destination: (req, file, cb) => { cb(null, uploadsDir); },
//   filename:    (req, file, cb) => { … }
// });


// अब multer को सीधे Cloudinary स्टोरेज इंजन के साथ इनिशियलाइज़ करें:
const upload = multer({ storage });

/**
 * POST /api/products
 * Body: multipart/form-data जिसमें फ़ील्ड्स:
 *  - title, description, price, discount, category, subcategory, colors, sizes (text/number)
 *  - images (file array, मैक्सिमम 4)
 */
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

    // 1) Category व Subcategory वैलिडेट करें
    const catDoc = await Category.findById(catId);
    if (!catDoc) return res.status(400).json({ message: 'Invalid category' });

    const subDoc = catDoc.subcategories.id(subId);
    if (!subDoc) return res.status(400).json({ message: 'Subcategory not in this category' });

    // 2) colors, sizes को array में बदलें (अगर वे comma-separated string हों)
    const colorArr = Array.isArray(colors)
      ? colors
      : (colors ? colors.split(',').map(s => s.trim()) : []);
    const sizeArr  = Array.isArray(sizes)
      ? sizes
      : (sizes ? sizes.split(',').map(s => s.trim()) : []);

    // 3) Cloudinary पर अपलोड हो चुकी फ़ाइलों (req.files) में से URL निकालें
    //    req.files[i].path में पूरी URL होती है, और req.files[i].filename में public_id
    const imageUrls     = req.files.map(f => f.path);
    const imagePublicIds = req.files.map(f => f.filename);

    // 4) नया Product बनाएं (MongoDB में सिर्फ़ JSON/टेक्स्ट + इमेज URL, public_id सेव करेंगे)
    const product = new Product({
      title,
      description,
      price:       Number(price),
      discount:    Number(discount),
      colors:      colorArr,
      sizes:       sizeArr,
      images:      imageUrls,       // [ 'https://res.cloudinary.com/.../abc.jpg', … ]
      publicIds:   imagePublicIds,  // [ 'mern_ecommerce_products/abc', … ]
      category:    catId,
      subcategory: {
        id:   subDoc._id,
        name: subDoc.name
      }
    });

    const saved = await product.save();
    return res.status(201).json(saved);

  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ message: err.message });
  }
});


/**
 * GET /api/products?category=...&subcategory=...
 * सभी products या फ़िल्टर किए हुए products लौटाएगा
 */
router.get('/', async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const filter = {};

    if (category)    filter.category          = category;
    if (subcategory) filter['subcategory.id'] = subcategory;

    const products = await Product
      .find(filter)
      .populate('category', 'name');

    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});


/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const prod = await Product
      .findById(req.params.id)
      .populate('category', 'name');

    if (!prod) return res.status(404).json({ message: 'Not found' });
    return res.json(prod);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});


/**
 * DELETE /api/products/:id
 * प्रोडक्ट को हटा कर साथ में Cloudinary से इमेज भी डिलीट करेंगे
 */
router.delete('/:id', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });

    // Cloudinary से सब इमेज public_id द्वारा डिलीट करें
    // (यह मान रहे हैं कि आपके Product मॉडल में publicIds: [Array] है)
    for (const pubId of prod.publicIds) {
      await cloudinary.uploader.destroy(pubId);
    }

    // MongoDB से प्रोडक्ट डिलीट करें
    await prod.remove();
    return res.json({ message: 'Product & its images deleted' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});


module.exports = router;






// const express = require('express');
// const multer  = require('multer');
// const path    = require('path');
// const fs      = require('fs');
// const Category = require('../models/Category');
// const Product  = require('../models/Product');
// const router  = express.Router();

// // 1)  uploads directory 
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // 2) multer storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     // you can customize filename as you like
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });

// // 3)  upload middleware
// const upload = multer({ storage });

// // 4) POST /api/products
// router.post('/', upload.array('images', 4), async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       price,
//       discount = 0,
//       category: catId,
//       subcategory: subId,
//       colors,
//       sizes
//     } = req.body;

//     // validate category
//     const catDoc = await Category.findById(catId);
//     if (!catDoc) return res.status(400).json({ message: 'Invalid category' });

//     // find subcategory inside it
//     const subDoc = catDoc.subcategories.id(subId);
//     if (!subDoc) return res.status(400).json({ message: 'Subcategory not in this category' });

//     // parse arrays
//     const colorArr = Array.isArray(colors)
//       ? colors
//       : (colors ? colors.split(',').map(s => s.trim()) : []);
//     const sizeArr = Array.isArray(sizes)
//       ? sizes
//       : (sizes ? sizes.split(',').map(s => s.trim()) : []);

//     // build image paths
//     const imagePaths = req.files.map(f => `/uploads/${f.filename}`);

//     // create product
//     const product = new Product({
//       title,
//       description,
//       price:    Number(price),
//       discount: Number(discount),
//       colors:   colorArr,
//       sizes:    sizeArr,
//       images:   imagePaths,
//       category: catId,
//       subcategory: {
//         id:   subDoc._id,
//         name: subDoc.name
//       }
//     });

//     const saved = await product.save();
//     res.status(201).json(saved);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // backend/routes/products.js
// router.get('/', async (req, res) => {
//   const { category, subcategory } = req.query;
//   const filter = {};

//   if (category)    filter.category              = category;
//   if (subcategory) filter['subcategory.id']     = subcategory;

//   // now only matching docs will be returned
//   const products = await Product
//     .find(filter)
//     .populate('category', 'name');
//   res.json(products);
// });

// // GET /api/products/:id
// router.get('/:id', async (req, res) => {
//   try {
//     const prod = await Product
//       .findById(req.params.id)
//       .populate('category', 'name');
//     if (!prod) return res.status(404).json({ message: 'Not found' });
//     res.json(prod);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// module.exports = router;
