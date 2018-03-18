// requires:
const express = require('express');
const router = express.Router();
const { catchExpressErrors } = require('../utils/errorHandlers');
const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController'); // temporal ''''auth'''' flow controller
const requestController = require('../controllers/requestController');

// Routes definition:
router.get('/', (req, res) => {
  res.send(process.env.APP_NAME || 'app');
});

// product:
router.get(`/api/product/v1/`,
  authController.isLogged,
  catchExpressErrors(productsController.getProducts),
);

// TODO: pagination, to be consumed by client app

router.get(`/api/product/v1/:slug`,
  authController.isLogged,
  catchExpressErrors(productsController.getProduct),
);

router.post(`/api/product/v1`,
  requestController.validateInput,
  productsController.validateInput,
  authController.isLogged,
  authController.canAddData,
  catchExpressErrors(requestController.handleRequest),
  catchExpressErrors(productsController.addProducts),
);

// export:
module.exports = router;