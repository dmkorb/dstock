import * as stockService from '../services/stocks.service.js';
import catchAsync from '../utils/catchAsync.js';

const getStocks = catchAsync(async (req, res) => {
  const results = await stockService.searchStocks(req.query.term);
  res.send(results)
});

const getBenchmarks = catchAsync(async (req, res) => {
  const results = await stockService.getBenchmarks(req.query.start_date);
  res.send(results)
})
export {
  getStocks,
  getBenchmarks
}