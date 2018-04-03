const logger = require('../utils/logger');
const mongoose = require('mongoose');
require('../models/Product');
const Product = mongoose.model('Product');
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
  // TODO: allow search by name, curr price, max historic price, min historic price, etc.
  if (typeof req.query.text === 'undefined' || !req.query.text.length) {
    // TODO: include this min length as enviroment variable
    logger.error(`failed input validation: there is no 'text' field in search`);
    return res.status(400).json({ status: 'KO', message: "Bad format. Key 'text' must be present" });
  }
  if (req.query.text.length < 3) {
    logger.error(`failed input validation: min length allowed for searching text is 3`);
    return res.status(400).json({ status: 'KO', message: "Bad format. Min length allowed for searching text is 3" });
  }
  next();
};

/**
 * Function to search products by query.
 * @param {*} req
 * @param {*} res
 */
exports.searchBy = async (req, res) => {
  // TODO: make this entry point to query by text, price, etc.
  // TODO: include search by slug
  // TODO: include pagination
  const text = req.query.text || '';
  console.log(`TEEEXT: ${text}`);
  const regex = new RegExp(`.*${text}.*`, 'img');
  console.log(regex);
  const products = await Product.aggregate([
    { $match : { name: regex } },
    { $project: { _id: 0, __v: 0 } },
  ]);
  res.status(200).json({
    status: 'OK',
    message: `Match ${products.length} products`,
    results: [...products]
  });
};
