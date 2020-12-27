import logger from '../config/logger.js';
import { EVENTS } from '../constants/index.js';
import { Stock } from '../models/index.js'
import * as provider from './alphavantage.service.js';
import { getEventManager} from '../libs/event.manager.js';

const em = getEventManager();

const getStockBySymbol = async (symbol) => {
  if (!symbol) throw new Error('No symbol provided');

  let stock = await Stock.findBySymbol(symbol);
  if (stock) return stock;

  const data = await provider.getCompanyInformation(symbol);
  stock = await Stock.create(data);
  
  logger.info(`Created stock ${symbol}: ${JSON.stringify(stock)}`)
  return stock;
}

const getCurrentPrice = async (symbol) => {
  // TODO: set update threshold; return our internal price if less than threshold
  const price = await provider.getCurrentPrice(symbol)
  logger.info(`GET current price for ${symbol}: ${price}`)
  // update price internally
  return price;
}

const getLastQuote = async (symbol) => {

}

const createTimeSeries = (data) => {
  
}

const getTimeSeries = async (symbol, options = {}) => {
  const stock = await getStockBySymbol(symbol);
  const ts = await provider.getDailyTimeSeries(symbol)

  logger.info(`Got time ${ts.length} series for ${symbol}`)
  const timeSeries = []

  // reverse order - start by first
  for (let i = ts.length - 1; i >= 0; i--) {
    let t = ts[i];
    // skip older entries
    if (options.start && new Date(t.date).getTime() < new Date(options.start).getTime()) continue;
    timeSeries.push(t)
  }

  return timeSeries;
}

export {
  getCurrentPrice,
  getStockBySymbol,
  getTimeSeries
}


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
    logger.info('onTradeCreated - timeseries length', timeSeries?.length);
  } catch (err) {

  }
}

/**
 * Event listners
 */
em.on(EVENTS.TRADE.TRADE_CREATED, onTradeCreated)