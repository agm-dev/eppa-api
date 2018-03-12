// requires:
const express = require('express');
const bodyParser = require('body-parser');
const { notFound, developmentErrors, productionErrors, logRequest } = require('./app/utils/errorHandlers');
const router = require('./app/routes/index');
const logger = require('./app/utils/logger');

require('dotenv').config();

logger.info(`init`);

const router = express.Router();
router.get('/', (req, res) => {
  res.send(process.env.APP_NAME || 'app');
});

// express set up:
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);
app.use(notFound);

if (process.env.NODE_ENV === 'prod') {
  logger.info(`using production errors handler`);
  app.use(productionErrors);
} else {
  logger.info(`using development errors handler`);
  app.use(developmentErrors);
}

// main:
app.set('port', process.env.PORT || 6666);
const server = app.listen(app.get('port'), () => {
  logger.info(`app running on port ${server.address().port}`);
});
