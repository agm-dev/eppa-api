// requires:
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const { notFound, developmentErrors, productionErrors, logRequest } = require('./app/utils/errorHandlers');
const router = require('./app/routes/index');
const logger = require('./app/utils/logger');
require('dotenv').config();
require('./app/models/Product');


logger.info(`init`);

// database connection:
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // ES6 promises
mongoose.connection.on('error', err => {
  logger.error(`mongoose connection: ${err.message}`);
  process.exit(1);
});

// express set up:
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logRequest);
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
