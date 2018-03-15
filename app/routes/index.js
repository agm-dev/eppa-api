// requires:
const express = require('express');
const router = express.Router();
const { catchErrors } = require('../utils/errorHandlers');
const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController'); // temporal ''''auth'''' flow controller

// Routes definition:
router.get('/', (req, res) => {
  res.send(process.env.APP_NAME || 'app');
});

// product:
router.get(`/api/product/v1/`,
  authController.isLogged,
  catchErrors(productsController.getProducts),
);

// TODO: pagination, to be consumed by client app

router.get(`/api/product/v1/:slug`,
  authController.isLogged,
  catchErrors(productsController.getProduct),
);

router.post(`/api/product/v1`,
  productsController.validateInput,
  authController.isLogged,
  authController.canAddData,
  catchErrors(productsController.addProducts),
);

// export:
module.exports = router;