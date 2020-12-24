import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { TODO } from '../utils/index.js';
import * as tradeService from '../services/trades.service.js';
import * as portfolioService from '../services/portfolios.service.js';

const getTrades = catchAsync(async (req, res) => {
  const trades = await tradeService.getTrades();
  res.send(trades);
});

const createTrade = catchAsync(async (req, res) => {
  await portfolioService.portfolioExists(req.body.portfolio_id)
  const trade = await tradeService.createTrade(req.body);
  res.status(httpStatus.CREATED).send(trade);
});

const updateTrade = TODO;
const removeTrade = TODO;

export {
  getTrades,
  createTrade,
  updateTrade,
  removeTrade
}