// backend/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary 
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce_product_image',         
    allowed_formats: ['jpg', 'jpeg', 'png'],   
    transformation: [{ width: 800, crop: 'limit' }],
   
  },
});

module.exports = { cloudinary, storage };
