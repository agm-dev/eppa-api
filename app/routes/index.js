// requires:
const express = require('express');
const router = express.Router();
const { catchExpressErrors } = require('../utils/errorHandlers');
const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController'); // temporal ''''auth'''' flow controller
const requestController = require('../controllers/requestController');
const searchController = require('../controllers/searchController');
require('dotenv').config();


const apiPrefix = process.env.API_PREFIX || '/api';

// Routes definition:
router.get('/', (req, res) => {
  res.send(process.env.APP_NAME || 'app');
});

// product:
router.get(`${apiPrefix}/product/v1/`,
  catchExpressErrors(productsController.getProducts),
);

router.get(`${apiPrefix}/product/v1/:slug`,
  catchExpressErrors(productsController.getProduct),
);

router.post(`${apiPrefix}/product/v1`,
  requestController.validateInput,
  productsController.validateInput,
  authController.isLogged,
  authController.canAddData,
  catchExpressErrors(requestController.handleRequest),
  catchExpressErrors(productsController.addProducts),
);

// search:
router.get(`${apiPrefix}/search/v1`,
  searchController.validateInput,
  catchExpressErrors(searchController.searchBy),
);

// export:
module.exports = router;