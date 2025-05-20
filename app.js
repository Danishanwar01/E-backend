const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/e-commerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));


const categoriesRouter = require('./routes/categories');
app.use('/api/categories', categoriesRouter);


const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const userdataRouter = require('./routes/userdata');
app.use('/api/userdata', userdataRouter);
app.use('/api/userdata', require('./routes/userdata'));

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

const cartRouter   = require('./routes/cart');
app.use('/api/cart', cartRouter);

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);


const reviewRouter = require('./routes/review');
app.use('/api/products', reviewRouter);

app.get('/', (req, res) => {
  res.send('Backend is running and MongoDB is connected!');
});


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
