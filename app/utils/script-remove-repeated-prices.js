const mongoose = require('mongoose');
require('../models/Product');
const Product = mongoose.model('Product');
require('dotenv').config();



(async () => {

  // database connection:
  mongoose.connect(process.env.DATABASE);
  mongoose.Promise = global.Promise; // ES6 promises
  mongoose.connection.on('error', err => {
    logger.error(`mongoose connection: ${err.message}`);
    process.exit(1);
  });

  const products = await Product.find({});
  console.log(`Found ${products.length} products`);
  for (let i=0; i<products.length; i++) {
    const prices = products[i].prices;
    const reversedPrices = prices.reverse();
    const pricesWithoutDuplicates = reversedPrices.reduce((result, price) => {
      if (!result.length || result[0].price !== price.price) {
        return [price, ...result];
      } else {
        return result;
      }
    }, []);
    const product = await Product.findOne({ _id: products[i]._id });
    product.prices = pricesWithoutDuplicates;
    await product.save();
    console.log(`updated product ${product._id}`);
  }
  console.log(`updated all products`);
})();
