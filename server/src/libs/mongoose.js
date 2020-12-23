import config from '../config/config.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options)
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

export default connectDatabase;