import httpStatus from 'http-status';
import { TRADE_TYPES, EVENTS } from '../../constants/index.js';
import { Trade } from "../models/index.js"
import ApiError from "../utils/ApiError.js";
import logger from '../config/logger.js';
import { getEventManager } from '../libs/event.manager.js';
import * as stocks from './stocks.service.js';

const em = getEventManager();

const tradeExists = async (tradeId) => {
  const exists = await Trade.exists({ _id: tradeId });
  if (!exists) throw new ApiError(httpStatus.NOT_FOUND, `Portfolio not found`);
}

const getTrades = async (filter = {}, options = {}) => {
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  const total_count = await Trade.countDocuments(filter);
  const trades = await Trade.find(filter).sort({ date: 1 }).limit(limit).skip(offset)
  const count = trades.length;
  return { count, limit, offset, total_count, trades };
}

const getTradesForPortfolioId = async (portfolio_id) => {
  const trades = await Trade.find({ portfolio_id }).sort({ date: 1 });
  return trades;
}

const createTrade = async (data) => {
  const stock = await stocks.getStockBySymbol(data.symbol);

  const value = Math.abs(data.quantity * data.unit_price);
  const total_amount = data.trade_type === TRADE_TYPES.BUY ? value : 0 - value;
  const quantity = data.trade_type === TRADE_TYPES.BUY ? data.quantity : 0 - data.quantity;

  const trade = await Trade.create({ ...data, quantity, total_amount, name: stock.name });
  
  logger.info(`Trade created: ID ${trade.id} for ${trade.quantity} shares of ${trade.symbol} at ${trade.unit_price}`)
  em.emit(EVENTS.TRADE.TRADE_CREATED, { trade });
  
  return trade;
}

const updateTradeById = async (tradeId, data) => {
  await tradeExists(tradeId);
  const trade = await Trade.findByIdAndUpdate(tradeId, { $set: data }, { new: true });
  logger.info(`Trade updated: ID ${trade.id}`);
  em.emit(EVENTS.TRADE.TRADE_UPDATED, { trade });
  return trade;
}

const removeTradeById = async (tradeId) => {
  await tradeExists(tradeId)
  await Trade.findByIdAndDelete(tradeId);
  logger.info(`Trade removed: ID ${tradeId}`);
  em.emit(EVENTS.TRADE.TRADE_REMOVED, { tradeId });
}

export {
  tradeExists,
  getTrades,
  getTradesForPortfolioId,
  createTrade,
  updateTradeById,
  removeTradeById
}