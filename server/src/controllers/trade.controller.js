import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import catchAsync from '../utils/catchAsync.js';
import { TODO } from '../utils/index.js';
import * as tradeService from '../services/trades.service.js';
import * as portfolioService from '../services/portfolios.service.js';
import { isDateWeekend } from '../utils/time.js';
import ApiError from '../utils/ApiError.js';

const getTrades = catchAsync(async (req, res) => {  
  const filter = pick(req.query, ['symbol', 'trade_type']);
  const options = pick(req.query, ['sort_by', 'limit', 'offset']);
  const trades = await tradeService.getTrades({ ...filter, user_id: req.user.id }, options);
  res.send(trades);
});

const createTrade = catchAsync(async (req, res) => {
  await portfolioService.doesPortfolioBelongToUser(req.body.portfolio_id, req.user.id);
  
  const { date } = req.body;
  if (isDateWeekend(date)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Date is on weekend`)
  }

  const trade = await tradeService.createTrade({ ...req.body, user_id: req.user.id });
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