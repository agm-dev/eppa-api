// requires:
const logger = require('../utils/logger');
const mongoose = require('mongoose');
require('dotenv').config();


/**
 * Function to validate input data from http
 * requests.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.validateInput = (req, res, next) => {
  // required field request_id to identify the request:
  if (typeof req.body.request_id === 'undefined') {
    logger.error(`failed input validation: there is no request_id in the request`)
    return res.status(400).json({ status: 'KO', message: "Bad format. Key 'request_id' is required"});
  }
  const REQUEST_ID_LENGTH = process.env.REQUEST_ID_LENGTH ? parseInt(process.env.REQUEST_ID_LENGTH) : 100;
  if (typeof req.body.request_id !== 'string' ||req.body.request_id.length !== REQUEST_ID_LENGTH) {
    logger.error(`failed input validation: request_id must be a ${REQUEST_ID_LENGTH} length string`);
    return res.status(400).json({ status: 'KO', message: `Bad format. Key 'request_id' must be a ${REQUEST_ID_LENGTH} length string` });
  }
  next();
};

exports.handleRequest = (req, res, next) => {
  next();
};