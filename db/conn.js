// backend/db/conn.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category'); 


dotenv.config();


const mongoURI = process.env.MONGO_URI;

//  const mongoURI = 'mongodb://127.0.0.1:27017/e-commerce';


const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 
};

mongoose
  .connect(mongoURI, options)
  .then(async () => {
    console.log('✅ MongoDB Atlas is connected!');

   
    await Category.deleteMany({});
    const categories = ['jeans', 'shirt', 't-shirt', 'trouser', 'hoodies', 'shorts', 'jackets', 'nightwear'];
    const docs = categories.map(name => ({ name }));
    await Category.insertMany(docs);
    console.log('✅ Seeded categories into Atlas database');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    process.exit(1);
  });
