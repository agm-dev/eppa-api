// requires:
const mongoose = require('mongoose');
const slug = require('slug');
mongoose.Promise = global.Promise; // this links mongoose Promise with the node built in Promise

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'You must supply a name for the product',
    lowercase: true,
    trim: true,
  },
  // slug will be automatically generated and used in client app for routing purpouses:
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  prices: [
    {
      price: {
        type: Number,
        required: 'You must supply a price for the product',
      },
      currency: {
        type: String,
        required: 'You must supply a currency value',
      },
      discount: {
        type: Number,
        default: 0,
      },
      date: {
        type: Date,
        default: Date.now
      },
    }
  ],
  min_price: {
    type: Number,
    default: null,
  },
  max_price: {
    type: Number,
    default: null,
  },
  region: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
  },
  platform: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
  },
  preorder: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    unique: true,
    trim: true,
    required: 'You must supply a link to the product',
  },
  image: {
    type: String,
    trim: true,
    default: '',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  }
});

// define indexes:
productSchema.index({
  name: 'text',
  slug: 'text',
  platform: 'text',
  region: 'text',
});

// pre saving hook to update 'updated' value and slug if required
productSchema.pre('save', async function (next) {
  this.updated = new Date();
  if (!this.isModified('name') && !this.isNew) {
    next();
    return;
  }
  this.slug = slug(this.name);
  // but now we have to find for existen slugs...
  let iteration = 0;
  do {
    iteration++;
    if (iteration > 1) {
      // generate unique slug:
      this.slug = `${this.slug}-${iteration}`;
    }
    let slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    let productsMatches = await this.constructor.find({ slug: slugRegEx });
  } while (productsMatches.length);
  next(); // this is middleware, so let's continue...
});

// TODO: maybe add static method to get all platforms, regions, etc...

module.exports = mongoose.model('Product', productSchema);