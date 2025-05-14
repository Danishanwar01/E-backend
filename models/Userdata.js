// backend/models/Userdata.js
const mongoose = require('mongoose');

const userdataSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  address:    { type: String },
  city:       { type: String },
  country:    { type: String },
  postalCode: { type: String },
  phone:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Userdata', userdataSchema);
