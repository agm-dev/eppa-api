// requires:
const logger = require('../utils/logger');
require('dotenv').config();


// vars:
const CLIENT_ID_BYPASS = process.env.CLIENT_ID_BYPASS || null;

// TODO: temporal
exports.isLogged = (req, res, next) => {
  const clientId = req.body.client_id || req.query.client_id;
  if (!clientId) {
    return res.status(400).json({ status: 'KO', message: 'Missing client_id in the request' }); // 400 - bad request
  }
  // TODO: const token = req.body.token || req.query.token || req.headers['x-access-token'];
  // let them pass if there is a client id bypass defined and matches with the client_id provided:
  // TODO: when login with oauth server is done, rememeber only use client_id bypass if client id bypass is set on config file
  if (!CLIENT_ID_BYPASS || clientId !== CLIENT_ID_BYPASS) {
    logger.warn(`unauthorized try to access resource`);
    return res.status(401).json({ status: 'KO', message: 'client_id is not valid' }); // 401 - unauthorized
  }
  next();
};

// TODO: temporal
exports.canAddData = (req, res, next) => {
  next();
};