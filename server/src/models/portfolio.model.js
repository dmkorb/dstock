import mongoose from 'mongoose';
import { getIdWithPrefix } from './plugins/nanoid.js';
import { toJSON } from './plugins/toJSON.js';

const portfolioSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => getIdWithPrefix('prt')
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  holdings: []
})

portfolioSchema.plugin(toJSON)

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export { Portfolio }