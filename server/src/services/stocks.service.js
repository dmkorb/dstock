import logger from '../config/logger.js';
import { EVENTS } from '../../constants/index.js';
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
  const price = await provider.getCurrentPrice(symbol)
  logger.info(`GET current price for ${symbol}: ${price}`)
  return price;
}

const getLastQuote = async (symbol) => {

}

const createTimeSeries = (data) => {
  
}

const getTimeSeries = async (symbol, options = {}) => {
  const stock = await getStockBySymbol(symbol);
  const ts = await provider.getDailyTimeSeries(symbol)

  console.log('Got time series', ts.length)
  const timeSeries = []

  // reverse order - start by first
  for (let i = ts.length - 1; i >= 0; i--) {
    let t = ts[i];
    // skip older entries
    if (options.start && new Date(t.date).getTime() < new Date(options.start).getTime()) continue;
    timeSeries.push(t)
  }

  console.log('Returning filtered time series', timeSeries.length)
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

    const timeSeries = await getTimeSeries(trade.symbol)
    console.log('onTradeCreated - timeseries length', timeSeries?.length);
  } catch (err) {

  }
}

/**
 * Event listners
 */
em.on(EVENTS.TRADE.TRADE_CREATED, onTradeCreated)