import logger from '../config/logger.js';
import { EVENTS } from '../constants/index.js';
import { getEventManager } from '../events/event.manager.js';
import { getTimeSeries } from '../services/stocks.service.js'

const em = getEventManager();

/**
 * Event handlers
 */
const onTradeCreated = async (data) => {
  try {
    const { trade } = data;
    if (!trade || !trade.symbol || !trade.portfolio_id) {
      throw new Error(`Trade created event with invalid trade object: ${JSON.stringify(trade)}`);
    }

    logger.info(`Stocks onTradeCreated handler - trade ID ${trade.id} for ${trade.symbol}`);

    // Get time series when a trade is created. Even if not used here, it'll be cached in Redis for later use.
    const timeSeries = await getTimeSeries(trade.symbol)
    logger.info('onTradeCreated - timeseries length', timeSeries.length);
  } catch (err) {
    logger.error(err);
  }
}

/**
 * Event listners
 */
em.on(EVENTS.TRADE.TRADE_CREATED, onTradeCreated)