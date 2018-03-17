// requires:
const logger = require('../utils/logger');
const mongoose = require('mongoose');
require('../models/Request');
const Request = mongoose.model('Request');
require('dotenv').config();


/**
 * Notes and aclarations:
 *
 * This request thing is to try to make the
 * POST requests idempotent, as other methods
 * like GET or UPDATE.
 *
 * We store the result of the first request
 * in database, identified by request_id, so
 * if we receive the same request (the same
 * request_id) again in the POST request, we
 * don't create another resource with the
 * same data, but we just return the same
 * response that we returned the first time,
 * as other idempotent method (GET) would do.
 *
 * We only store request on successful POST
 * requests.
 */

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

/**
 * Handles input request.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.handleRequest = async (req, res, next) => {
  const request = await Request.findOne({ request_id: req.body.request_id });
  if (request) {
    logger.info(`received same request with request_id ${request.request_id}, sending same successful response`);
    request.retries++;
    await request.save();
    return res.status(201).json(request.response);
  }
  next();
};