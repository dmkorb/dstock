import mongoose from 'mongoose';
import { getIdWithPrefix } from './plugins/nanoid.js';
import { toJSON } from './plugins/toJSON.js';

const stockSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => getIdWithPrefix('stk')
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  symbol: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  asset_type: String,
  exchange: String,
  currency: String,
  country: String,
  sector: String,
  industry: String
})

stockSchema.plugin(toJSON)

stockSchema.statics.findBySymbol = function(symbol, cb) {
  return this.findOne({ symbol }, cb);
};

const Stock = mongoose.model('Stock', stockSchema);

export { Stock }