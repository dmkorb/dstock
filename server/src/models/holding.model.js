import mongoose from 'mongoose';
import { getIdWithPrefix } from './plugins/nanoid.js';
import { toJSON } from './plugins/toJSON.js';

const holdingSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => getIdWithPrefix('hld')
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
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
  shares: {
    type: Number,
    default: 0
  },
  // total_equity: {
  //   type: Number,
  //   default: 0
  // },
  amount_invested: {
    type: Number,
    default: 0
  },
  amount_withdrawn: {
    type: Number,
    default: 0
  },
  // performance: {
  //   type: Number,
  //   default: 0
  // },
  first_investment: {
    type: Date,
    required: true
  },
  portfolio_id: {
    type: String
  },
})

holdingSchema.plugin(toJSON)

holdingSchema.pre('save', function() {
	this.updated_at = new Date();
});

holdingSchema.pre('update', function() {
	this.updated_at = new Date();
});

const Holding = mongoose.model('Holding', holdingSchema);

export { Holding }