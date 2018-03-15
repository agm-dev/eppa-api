const logger = require('../utils/logger');
const mongoose = require('mongoose');
require('../models/Product');
const Product = mongoose.model('Product');


/**
 * Function to validate input data from http post request.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.validateInput = (req, res, next) => {
  if (typeof req.body.products === 'undefined') {
    logger.error(`failed input validation: there is no 'products' key`);
    return res.status(400).json({ status: 'KO', message: "Bad format. Key 'products' must be present" });
  }
  if (!Array.isArray(req.body.products)) {
    logger.error(`failed input validation: products is not an array`);
    return res.status(400).json({ status: 'KO', message: "Bad format. Key 'products' must be an array of products" });
  }
  next();
};

/**
 * Function to return standard product data object
 * or null if rawProductData format is not valid
 * @param {*} rawProduct
 */
const formatProduct = rawProduct => {
  if (
    typeof rawProduct.name !== 'string' ||
    !rawProduct.name.length ||
    typeof rawProduct.price === 'undefined' ||
    isNaN(Number(rawProduct.price)) ||
    typeof rawProduct.link !== 'string' ||
    !rawProduct.link.length ||
    typeof rawProduct.currency !== 'string' ||
    !rawProduct.currency.length
  ) {
    return null;
  }
  const product = {
    name: rawProduct.name,
    link: rawProduct.link,
    price: rawProduct.price,
    currency: rawProduct.currency,
  };
  // check if add discount field:
  if (typeof rawProduct.discount !== 'undefined') {
    if (!isNaN(Number(rawProduct.discount))) {
      product.discount = parseFloat(rawProduct.discount);
    } else if (typeof rawProduct.discount === 'string' && rawProduct.discount.indexOf('%') !== -1) {
      product.discount = parseFloat(rawProduct.discount.replace(/%|-/img, ''));
    }
  }
  // check if add image:
  if (typeof rawProduct.image === 'string' && rawProduct.image.length) {
    product.image = rawProduct.image;
  }
  // check if add preorder:
  if (rawProduct.preorder === true || rawProduct.preorder === 'true') {
    product.preorder = true;
  }
  // check if add region:
  if (typeof rawProduct.region === 'string' && rawProduct.region.length) {
    product.region = rawProduct.region;
  }
  // check if add platform:
  if (typeof rawProduct.platform === 'string' && rawProduct.platform.length) {
    product.platform = rawProduct.platform;
  }

  return product;
}

// TODO: temporal
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// TODO: temporal
exports.getProduct = async (req, res) => {
  const product = await Product.find({ slug: 'test' });
  res.send('there is no products');
};

// TODO: temporal
exports.addProducts = async (req, res) => {

  res.send('ok!');
};