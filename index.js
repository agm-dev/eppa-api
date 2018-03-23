// requires:
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { notFound, developmentErrors, productionErrors, logRequest } = require('./app/utils/errorHandlers');
const router = require('./app/routes/index');
const logger = require('./app/utils/logger');
require('dotenv').config();


logger.info(`init`);

// database connection:
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // ES6 promises
mongoose.connection.on('error', err => {
  logger.error(`mongoose connection: ${err.message}`);
  process.exit(1);
});

// require models after database connection:
require('./app/models/Request');
const Request = mongoose.model('Request');

// express set up:
const app = express();
app.use(cors()); // FUCK CORS FUCK FUCK FUCK FUCK
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


// interval to remove requests:
const intervalToCheckRequests = (typeof process.env.MINUTES_INTERVAL_TO_CHECK_REQUESTS !== 'undefined') ? (parseInt(process.env.MINUTES_INTERVAL_TO_CHECK_REQUESTS) * 60 * 1000) : (10 * 60 * 1000); // value in miliseconds
const ageToRemove = (typeof process.env.MINUTES_AGE_TO_REMOVE_REQUEST !== 'undefined') ? (parseInt(process.env.MINUTES_AGE_TO_REMOVE_REQUEST) * 60 * 1000) : 15 * 60 * 1000; // value in miliseconds

const removeRequestsInterval = setInterval(() => {
  const now = (new Date).getTime(); // now in miliseconds;
  const targetDate = now - ageToRemove;
  Request.removeOlderThan(targetDate, () => {
    logger.info(`removed old requests`);
  });
}, intervalToCheckRequests);
logger.info(`interval to check requests set each ${intervalToCheckRequests} miliseconds to remove requests older than ${ageToRemove} miliseconds`);