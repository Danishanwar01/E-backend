


// // backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   
  })
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));


const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const userdataRouter = require('./routes/userdata');
const ordersRouter    = require('./routes/orders');
const cartRouter      = require('./routes/cart');
const adminRouter     = require('./routes/admin');
const reviewRouter    = require('./routes/review');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/userdata', userdataRouter);

app.use('/api/orders', ordersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewRouter);  

app.get('/', (req, res) => {
  res.send('Backend is running and connected to MongoDB Atlas!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
