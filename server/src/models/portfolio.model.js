import mongoose from 'mongoose';
import { getIdWithPrefix } from './plugins/nanoid.js';
import { toJSON } from './plugins/toJSON.js';

const portfolioSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => getIdWithPrefix('prt')
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
})

portfolioSchema.plugin(toJSON)

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export { Portfolio }