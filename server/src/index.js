import app from './app.js';
import config from './config/config.js';
import logger from './config/logger.js';
import { initConsumers } from './events/index.js';
import { connectDatabase } from './libs/mongoose.js';

let server;

const start = async () => {
  try {
    await initConsumers();
    await connectDatabase();
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  } catch (err) {
    logger.error(err);
    exitHandler();    
  }
}

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

start()