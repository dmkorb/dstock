import logger from '../config/logger.js';
import { EVENTS } from '../constants/index.js';
import { getEventManager} from '../events/event.manager.js';
import {
  createPortfolio,
} from '../services/portfolios.service.js';

const em = getEventManager();

const onUserCreatedEvent = async ({ user }) => {
  try {
    logger.info(`Portfolios service - onUserCreatedEvent handler - user ID ${user.id}`);
    const portfolio = await createPortfolio({name: `${user.name}'s portfolio`, user_id: user.id});
    logger.info(`Portfolios service - created portfolio ${portfolio.id} for user ${user.name} (${user.id})`);
  } catch (err) {
    logger.error(err);
  }
}

/**
 * Event listners
 */
em.on(EVENTS.USER.USER_CREATED, onUserCreatedEvent)