const logger = require('../utils/logger');
const mongoose = require('mongoose');
require('../models/Product');
require('../models/Request');
const Product = mongoose.model('Product');
const Request = mongoose.model('Request');
require('dotenv').config();


// vars:
const EXCLUDED_FIELDS = { _id: false, __v: false };
const MAX_RESULTS = process.env.MAX_RESULTS ? parseInt(process.env.MAX_RESULTS) : 100;

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
    if (rawProduct.discount === null) {
      product.discount = 0;
    } else if (!isNaN(Number(rawProduct.discount))) {
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
  const nProducts = await Product.count();
  const nPages = Math.ceil(nProducts / MAX_RESULTS);
  let page;
  if (typeof req.body.page !== 'undefined' && req.body.page > 0) {
    page = parseInt(req.body.page);
  } else if (typeof req.query.page !== 'undefined' && req.query.page > 0) {
    page = parseInt(req.query.page);
  } else {
    page = 1;
  }
  const skip = (page - 1) * MAX_RESULTS;
  const products = await Product.find({}, EXCLUDED_FIELDS)
    .sort({ created: -1 })
    .skip(skip)
    .limit(MAX_RESULTS);
  res.status(200).json({
    status: 'OK',
    message: `Returning ${products.length} products from a total of ${nProducts} found`,
    page,
    pages: nPages,
    total_products: nProducts,
    results: [...products]
  });
};

// TODO: temporal
exports.getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }, EXCLUDED_FIELDS);
  if (!product) {
    return res.status(404).json({ status: 'KO', message: 'Not found' });
  }
  res.status(200).json({ status: 'OK', message: 'found', results: [product] });
};

// TODO: temporal
exports.addProducts = async (req, res) => {
  const products = req.body.products;
  let errors = 0;
  let processed = 0;
  let created = 0;
  let updated = 0;
  for (let i=0; i<products.length; i++) {
    const productData = formatProduct(products[i]);
    if (productData === null) {
      errors++;
    } else {
      // check if that product exists and update or create:
      const product = await Product.findOne({ link: productData.link });
      if (product) {
        // update:
        product.name = productData.name;
        let price = { price: productData.price, currency: productData.currency };
        if (typeof productData.discount !== 'undefined') price.discount = productData.discount;
        if (!product.prices.length || price.price != product.prices[0].price) { // only add a new price if it's different from last one
          product.prices = [price, ...product.prices]; // this way product.prices[0] will be always the current price
        }

        if (productData.price < product.min_price) {
          product.min_price = productData.price;
        }
        if (productData.price > product.max_price) {
          product.max_price = productData.price;
        }

        if (typeof productData.image !== 'undefined') product.image = productData.image;
        if (typeof productData.preorder !== 'undefined') product.preorder = productData.preorder;
        if (typeof productData.platform !== 'undefined') product.platform = productData.platform;
        if (typeof productData.region !== 'undefined') product.region = productData.region;
        await product.save();
        updated++;
      } else {
        // create:
        productData.prices = [
          { price: productData.price, currency: productData.currency }
        ];
        productData.min_price = productData.price;
        productData.max_price = productData.price;
        if (typeof productData.discount !== 'undefined') {
          productData.prices[0].discount = productData.discount;
          delete productData.discount;
        }
        delete productData.price;
        delete productData.currency;
        const newProduct = new Product(productData);
        await newProduct.save();
        created++;
      }
    }
    processed++;
  }

  // send response:
  const result = {
    processed,
    success: processed - errors,
    errors,
    created,
    updated,
  };
  logger.info(`request to add ${processed} products: ${result.success} success, ${errors} errors, ${created} created, ${updated} updated`);
  const response = { status: 'OK', message: 'Your products have been processed', result };
  const request = new Request({
    request_id: req.body.request_id,
    response,
  });
  await request.save();
  res.status(201).json(response);
};