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


app.get('/', (req, res) => {
  res.send('Backend is running and MongoDB is connected!');
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
