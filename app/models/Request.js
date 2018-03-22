// requires:
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // tells mongoose to work with nodejs promises


const requestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: 'You must supply a request_id',
    trim: true,
    unique: true,
  },
  retries: {
    type: Number,
    default: 0,
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

// define indexes:
requestSchema.index({
  request_id: 'text',
});

// pre saving hook to update 'updated' value:
requestSchema.pre('save', async function (next) {
  this.updated = new Date();
  next();
});

// static method to remove all requests old enough:
requestSchema.statics.removeOlderThan = function (date, cb) {
  this.deleteMany({ updated: { $lte: date } }, cb);
}

module.exports = mongoose.model('Request', requestSchema);