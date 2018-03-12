// requires:
const express = require('express');
const router = express.Router();
//const { catchErrors } = require('../utils/errorHandlers');


// Routes definition:
router.get('/', (req, res) => {
  res.send(process.env.APP_NAME || 'app');
});

// export:
module.exports = router;