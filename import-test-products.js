const axios = require('axios');
const testProducts = require('./app/data/test-data.json');
require('dotenv').config();

console.log('init import test products script');
const port = process.env.PORT || 6666;
const clientIdBypass = process.env.CLIENT_ID_BYPASS || '';

axios.post(`http://localhost:${port}/api/product/v1`, {
  products: testProducts,
  client_id: clientIdBypass,
}).then(response => {
  console.log(`SUCCESS: ${response.status} - ${response.data}`);
}).catch(error => {
  console.log(`ERROR: ${error.code} - ${error.message}`);
});