import httpStatus from 'http-status';
import { EVENTS } from '../../constants/index.js';
import { getEventManager} from '../libs/event.manager.js';
import logger from '../config/logger.js';
import { Holding } from '../models/index.js';
import { getTrades } from './trades.service.js';
import * as stocks from './stocks.service.js';
import { calculateGainAndPerformance } from '../utils/calculators.js';
import { isDateOlderThanHours } from '../utils/time.js';

const em = getEventManager();

const doesHoldingExist = async (holdingId) => {
  const exists = await Holding.exists({ _id: holdingId });
  if (!exists) throw new ApiError(httpStatus.NOT_FOUND, `Holding not found`);
}

const getHoldings = async (filter = {}, options = {}) => {
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  const total_count = await Holding.countDocuments(filter);
  const holdings = await Holding.find(filter).sort({ created_at: -1 }).limit(limit).skip(offset)
  const count = holdings.length;
  return { count, limit, offset, total_count, holdings };
}

const getHoldingPerformance = async (holding) => {
  const quote = await stocks.getCurrentPrice(holding.symbol).catch(() => {});
  if (!quote) return holding;

  const equity = holding.shares * quote;
  const { gains, performance } = calculateGainAndPerformance(equity, 
    holding.amount_invested, 
    holding.amount_withdrawn);

  return { ...holding.toJSON(), quote, equity, gains, performance };
}

const getHoldingById = async (holdingId) => {
  let holding = await Holding.findById(holdingId);
  if (!holding) throw new ApiError(httpStatus.NOT_FOUND, `Holding not found`);
  
  //refresh positions every hour
  if (isDateOlderThanHours(holding.positions_updated_at, 1)) {
    holding = await updateHoldingPosition(holding.id);
  }

  // const holdingPerformance = await getHoldingPerformance(holding);
  // return {...holdingPerformance, positions};
  return getHoldingPerformance(holding);
}

const getHoldingsForPortfolioId = async (portfolio_id) => {
  const rawHoldings = await Holding.find({ portfolio_id })
  const holdings = await Promise.all(rawHoldings.map(async holding => getHoldingPerformance(holding)));
  return holdings;
}

const getHoldingTrades = async (holdingId) => {
  const holding = await Holding.findById(holdingId);

  const { trades } = await getTrades({ symbol: holding.symbol, portfolio_id: holding.portfolio_id })
  // trades.forEach(trade => console.log(trade))

  return trades;
}

const getHoldingForSymbol = async (symbol, portfolio_id) => {
  const holding = await Holding.findOne({ symbol, portfolio_id })
  return holding;
}

const createHolding = async (data) => {
  const holding = await Holding.create(data);
  logger.info(`Holding created: ID ${holding.id} portfolio ${holding.portfolio_id} symbol ${holding.symbol}`);
  em.emit(EVENTS.HOLDING.HOLDING_CREATED, { holding });
  return holding;
}

const updateHolding = async (holdingId, data) => {
  await doesHoldingExist(holdingId);
  const holding = await Holding.findByIdAndUpdate(holdingId, { $set: data }, { new: true });
  logger.info(`Holding updated: ID ${holding.id}`);
  em.emit(EVENTS.HOLDING.HOLDING_UPDATED, { holding });
  return holding;
}

const updateHoldingPosition = async (holdingId) => {
  let holding = await Holding.findById(holdingId);
  const positions = [];
  const trades = await getHoldingTrades(holdingId);
  const ts = await stocks.getTimeSeries(holding.symbol, { start: holding.first_investment })
  
  let position = 0;
  let invested = 0;
  let withdrawn = 0;
  ts.forEach(t => {
    let tradesOnDay = trades.filter(trd => t.date === trd.date);
    if (tradesOnDay.length) {
      tradesOnDay.forEach(trd => {
        position += trd.quantity;
        trd.total_amount > 0 ? 
          invested += trd.total_amount : 
          withdrawn += Math.abs(trd.total_amount)
      })
    }
    const date = t.date;
    const price = t.adjusted_close;
    const equity = price * position;
    const { gains, performance } = calculateGainAndPerformance(equity, invested, withdrawn);
    
    console.log(`${t.date} position ${position} price ${t.adjusted_close} equity ${t.adjusted_close * position}`)
    positions.push({
      date,
      equity,
      price,
      position,
      gains,
      performance
    })
  })

  holding = await Holding.findByIdAndUpdate(holdingId, { $set: { positions, positions_updated_at: new Date() } }, { new: true });
  
  return holding;
}

export {
  getHoldings,
  getHoldingById,
  getHoldingTrades,
  getHoldingForSymbol,
  getHoldingsForPortfolioId,
  
  updateHoldingPosition,

  createHolding,
  updateHolding
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

    logger.info(`Holding onTradeCreated handler - trade ID ${trade.id} for ${trade.symbol}`);

    let holding = await getHoldingForSymbol(trade.symbol, trade.portfolio_id)
    if (!holding) {
      holding = await createHolding({
        name: trade.name,
        symbol: trade.symbol,
        first_investment: trade.date,
        portfolio_id: trade.portfolio_id,
      })
    }

    // Update position
    holding.shares += trade.quantity;
    if (trade.total_amount > 0) {
      holding.amount_invested += trade.total_amount;
    } else {
      holding.amount_withdrawn += Math.abs(trade.total_amount);
    }
    
    // Update first investment date if older 
    if (new Date(trade.date).getTime() < new Date(holding.first_investment).getTime()) {
      holding.first_investment = trade.date;
    }

    await holding.save();

    // recalculate position
    updateHoldingPosition(holding.id).catch(() => {})

  } catch (err) {
    logger.error(err);
  }
}

/**
 * Event listners
 */
em.on(EVENTS.TRADE.TRADE_CREATED, onTradeCreated)