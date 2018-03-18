const axios = require('axios');
const testProducts = require('./app/data/test-data.json');
require('dotenv').config();

console.log('init import test products script');
const port = process.env.PORT || 6666;
const clientIdBypass = process.env.CLIENT_ID_BYPASS || '';
const REQUEST_ID_LENGTH = process.env.REQUEST_ID_LENGTH || 100;

function getRandomString(l) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i=0; i<l; i++) {
    result += chars.split('')[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function logSuccess(response) {
  console.log(`SUCCESS: ${response.status} - ${JSON.stringify(response.data)}`);
}

function logError(error) {
  console.log(`ERROR: ${error.code} - ${error.message}`);
}

const url = `http://localhost:${port}/api/product/v1`;
const postData = {
  products: testProducts,
  client_id: clientIdBypass,
  request_id: getRandomString(REQUEST_ID_LENGTH),
};

axios.post(
  url,
  postData
).then(response => {
  logSuccess(response);
  setTimeout(() => {
    axios.post(
      url,
      postData
    ).then(response => {
      logSuccess(response);
    }).catch(error => {
      logError(error);
    });
  }, 1000);
}).catch(error => {
  logError(error);
  setTimeout(() => {
    axios.post(
      url,
      postData
    ).then(response => {
      logSuccess(response);
    }).catch(error => {
      logError(error);
    });
  }, 1000);
});