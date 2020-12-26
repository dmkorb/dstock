import mongoose from 'mongoose';
import { getIdWithPrefix } from './plugins/nanoid.js';
import { toJSON } from './plugins/toJSON.js';
import { TRADE_TYPES } from '../constants/index.js';

const tradeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => getIdWithPrefix('trd')
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  symbol: {
    type: String,
    trim: true,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit_price: {
    type: Number,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  brokerage: {
    type: Number
  },
  broker_name: {
    type: String,
    trim: true,
  },
  trade_type: {
    type: String,
    enum: Object.values(TRADE_TYPES),
    required: true
  },
  portfolio_id: {
    type: String,
    ref: 'Portfolio'
  }
})

tradeSchema.plugin(toJSON)

const Trade = mongoose.model('Trade', tradeSchema);

export { Trade }
