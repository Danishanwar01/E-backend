// seedCategories.js  (project root me)
const mongoose = require('mongoose');
const Category = require('./models/Category');
const categories = ['jeans','shirt','t-shirt','trouser','hoodies','shorts','jackets','nightwear'];

mongoose.connect('mongodb://127.0.0.1:27017/e-commerce', { useNewUrlParser:true, useUnifiedTopology:true })
  .then(async () => {
    await Category.deleteMany({});
    const docs = categories.map(name => ({ name }));
    await Category.insertMany(docs);
    console.log('Seeded categories');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
