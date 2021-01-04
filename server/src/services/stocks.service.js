import logger from '../config/logger.js';
import { EVENTS } from '../constants/index.js';
import { Stock } from '../models/index.js'
import * as provider from './alphavantage.service.js';
import * as twelvedata from './twelvedata.service.js';
import { getEventManager} from '../events/event.manager.js';

const em = getEventManager();

const searchStocks = async (term) => {
  // TODO: create and mantain our own stock objects
  const data = await provider.searchStockSymbols(term);
  return data;
}

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

const getBenchmarks = async (startDate) => {
  const data = await twelvedata.getBenchmarkIndexes(startDate);
  return data;
}

export {
  searchStocks,
  getCurrentPrice,
  getStockBySymbol,
  getTimeSeries,
  getBenchmarks
}

