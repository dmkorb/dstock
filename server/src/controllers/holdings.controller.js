import pick from '../utils/pick.js';
import catchAsync from "../utils/catchAsync.js";
import * as holdingsService from '../services/holdings.service.js';
import * as stocks from '../services/stocks.service.js';

const getHoldings = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit', 'offset']);
  const filter = { user_id: req.user.id }
  const holdings = await holdingsService.getHoldings(filter, options);
  res.send(holdings);
})

const getHolding = catchAsync(async (req, res) => {
  const { id } = req.params;
  await holdingsService.doesHoldingBelongsToUser(id, req.user.id);
  const [holding, trades] = await Promise.all([
    holdingsService.getHoldingById(id),
    holdingsService.getHoldingTrades(id)
  ])
  
  // const prices = await stocks.getTimeSeries(holding.symbol, { start: holding.first_investment })
  // const position = await holdingsService.updateHoldingPosition(req.params.id);
  res.send({ ...holding, trades });
})

export {
  getHoldings,
  getHolding,
}