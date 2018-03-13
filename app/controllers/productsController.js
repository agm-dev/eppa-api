const mongoose = require('mongoose');
require('../models/Product');
const Product = mongoose.model('Product');


// TODO: temporal
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// TODO: temporal
exports.getProduct = (req, res) => {
  res.send('there is no products');
};

// TODO: temporal
exports.addProducts = (req, res) => {
  res.send('ok!');
};