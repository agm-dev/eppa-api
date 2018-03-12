// requires:
const logger = require('./logger');


// functions:

/**
 * Handles express response when a route does
 * not exists. Express typical input params:
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.notFound = (req, res, next) => {
  const reqData = {
    userAgent: req.headers['user-agent'],
    url: req.url,
    method: req.method,
  };
  logger.error(`404 error: ${JSON.stringify(reqData)}`);
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/**
 * Handles express response on error when is
 * development environment. Express typical input
 * params:
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.developmentErrors = (err, req, res) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };
  const reqData = {
    userAgent: req.headers['user-agent'],
    url: req.url,
    method: req.method,
    errorMessage: errorDetails.message,
    errorStatus: errorDetails.status,
  };
  logger.error(`express developmentError: ${JSON.stringify(reqData)}`);
  res.status(err.status || 500);
  res.send(JSON.stringify(errorDetails));
};

/**
 * Handles express response on error when is
 * production environment. Express typical input
 * params:
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.productionErrors = (err, req, res) => {
  const errorDetails = {
    message: err.message,
    status: err.status,
  };
  const reqData = {
    userAgent: req.headers['user-agent'],
    url: req.url,
    method: req.method,
    errorMessage: errorDetails.message,
    errorStatus: errorDetails.status,
  };
  logger.error(`express productionError: ${JSON.stringify(reqData)}`);
  res.status(err.status || 500);
  res.send(JSON.stringify(err.message));
};

/**
 * Error handler function to wrap async/await calls:
 * @param {*} fn
 */
exports.catchErrors = function (fn) {
  return function (...params) {
    return fn(...params).catch(function (err) {
      logger.error(`catchError -> ${err.name}: ${err.message}`);
    });
  };
};

/**
 * Express middleware to log request basic info:
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.logRequest = (req, res, next) => {
  logger.info(`HTTP Request - ${req.method} - ${req.url} - ${req.headers['user-agent']}`);
  next();
};