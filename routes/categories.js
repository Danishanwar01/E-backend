// routes/categories.js

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

////// EXISTING CATEGORY ROUTES //////

// Get all categories
router.get('/', async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json(cats);
});

// Create category
router.post('/', async (req, res) => {
  const { name } = req.body;
  const exists = await Category.findOne({ name });
  if (exists) return res.status(409).json({ message: 'Category already exists' });
  const newCat = new Category({ name });
  const saved = await newCat.save();
  res.status(201).json(saved);
});

////// SUBCATEGORY ROUTES //////

// 1) List subcategories of a category
router.get('/:catId/subcategories', async (req, res) => {
  const { catId } = req.params;
  const cat = await Category.findById(catId);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat.subcategories);
});

// 2) Add a subcategory (brand) to a category
router.post('/:catId/subcategories', async (req, res) => {
  const { catId } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Subcategory name required' });

  const cat = await Category.findById(catId);
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  // Prevent duplicates:
  if (cat.subcategories.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ message: 'Subcategory already exists' });
  }

  cat.subcategories.push({ name });
  await cat.save();
  res.status(201).json(cat.subcategories);
});

// 3) Update a subcategory name
router.put('/:catId/subcategories/:subId', async (req, res) => {
  const { catId, subId } = req.params;
  const { name } = req.body;

  const cat = await Category.findById(catId);
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  const sub = cat.subcategories.id(subId);
  if (!sub) return res.status(404).json({ message: 'Subcategory not found' });

  sub.name = name;
  await cat.save();
  res.json(sub);
});


// DELETE /api/categories/:catId/subcategories/:subId
router.delete('/:catId/subcategories/:subId', async (req, res) => {
  const { catId, subId } = req.params;

  const cat = await Category.findById(catId);
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  // Filter out the subcategory by ID
  const beforeCount = cat.subcategories.length;
  cat.subcategories = cat.subcategories.filter(
    s => s._id.toString() !== subId
  );

  if (cat.subcategories.length === beforeCount) {
    return res.status(404).json({ message: 'Subcategory not found' });
  }

  await cat.save();
  res.json({ message: 'Subcategory deleted' });
});




module.exports = router;
