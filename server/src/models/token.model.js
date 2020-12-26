import mongoose from 'mongoose';
import { toJSON } from './plugins/toJSON.js';
import { getIdWithPrefix } from './plugins/nanoid.js';

const tokenSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => getIdWithPrefix('tkn')
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['refresh', 'resetPassword'],
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  blacklisted: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

tokenSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const Token = mongoose.model('Token', tokenSchema);

export { Token };
