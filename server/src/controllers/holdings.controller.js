import catchAsync from "../utils/catchAsync.js";
import * as holdingsService from '../services/holdings.service.js';
import * as stocks from '../services/stocks.service.js';

const getHoldings = catchAsync(async (req, res) => {
  const holdings = await holdingsService.getHoldings();
  res.send(holdings);
})

const getHolding = catchAsync(async (req, res) => {
  const holding = await holdingsService.getHoldingById(req.params.id);
  const trades = await holdingsService.getHoldingTrades(req.params.id);
  const prices = await stocks.getTimeSeries(holding.symbol, { start: holding.first_investment })
  // const position = await holdingsService.updateHoldingPosition(req.params.id);
  res.send({ ...holding, trades });
})

const getHoldingProfit = catchAsync(async (req, res) => {
  
  res.send({});
})

export {
  getHoldings,
  getHolding,
  getHoldingProfit
}