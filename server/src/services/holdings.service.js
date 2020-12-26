import httpStatus from 'http-status';
import { EVENTS } from '../constants/index.js';
import { getEventManager} from '../libs/event.manager.js';
import logger from '../config/logger.js';
import { Holding } from '../models/index.js';
import { getTrades } from './trades.service.js';
import * as stocks from './stocks.service.js';
import { calculateGainAndPerformance } from '../utils/calculators.js';
import { isDateOlderThanHours } from '../utils/time.js';
import ApiError from '../utils/ApiError.js';

const em = getEventManager();

const doesHoldingExist = async (holdingId) => {
  const exists = await Holding.exists({ _id: holdingId });
  if (!exists) throw new ApiError(httpStatus.NOT_FOUND, `Holding s not found`);
}

const doesHoldingBelongsToUser = async (holdingId, user_id) => {
  await doesHoldingExist(holdingId);
  const exists = await Holding.exists({ _id: holdingId, user_id });
  if (!exists) throw new ApiError(httpStatus.FORBIDDEN, `Holding doesn't belong to this user`);
}

const getHoldings = async (filter = {}, options = {}) => {
  const limit = Number(options.limit || 50);
  const offset = Number(options.offset || 0);
  const total_count = await Holding.countDocuments(filter);
  const holdings = await Holding
    .find(filter)
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(offset);

  const performance = await Promise.all(holdings.map(holding => getHoldingPerformance(holding)))
  
  const count = holdings.length;
  return { count, limit, offset, total_count, holdings: performance };
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

const updateHoldingById = async (holdingId, data) => {
  await doesHoldingExist(holdingId);
  const holding = await Holding.findByIdAndUpdate(holdingId, { $set: data }, { new: true });
  logger.info(`Holding updated: ID ${holding.id}`);
  em.emit(EVENTS.HOLDING.HOLDING_UPDATED, { holding });
  return holding;
}

const getUpdatedHoldingPositions = async (holdingId) => {
  let holding = await Holding.findById(holdingId);
  const positions = [];
  const trades = await getHoldingTrades(holdingId);
  const ts = await stocks.getTimeSeries(holding.symbol, { start: holding.first_investment })
  
  logger.info(`Updating holding position for holding ${holding.id} (${holding.symbol})`);

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
    
    logger.info(`Position: ${t.date} ${position} shares of ${t.symbol} at $${t.adjusted_close}. Equity ${t.adjusted_close * position}`)

    positions.push({
      date,
      equity,
      price,
      position,
      gains,
      invested,
      withdrawn,
      performance
    })
  })

  logger.info(`Returning ${positions.length} positions of ${holding.symbol}`)
  
  return positions;
}

const updateHoldingPosition = async (holdingId) => {
  const positions = await getUpdatedHoldingPositions(holdingId);
  const holding = await updateHoldingById(holdingId, { 
      positions,
      positions_updated_at: new Date()
    });
  logger.info(`Holding positions updated: ID ${holding.id}`);
  em.emit(EVENTS.HOLDING.HOLDING_POSITIONS_UPDATED, { holding });
  return holding;
}

export {
  doesHoldingBelongsToUser,
  
  getHoldings,
  getHoldingById,
  getHoldingTrades,
  getHoldingForSymbol,
  getHoldingsForPortfolioId,
  
  getUpdatedHoldingPositions,

  createHolding,
  updateHoldingById
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
        user_id: trade.user_id,
        first_investment: trade.date,
        portfolio_id: trade.portfolio_id,
      })
    }

    // Update position
    let shares = holding.shares;
    let amount_invested = holding.amount_invested;
    let amount_withdrawn = holding.amount_withdrawn;
    let first_investment = holding.first_investment;

    shares += trade.quantity;
    if (trade.total_amount > 0) {
      amount_invested += trade.total_amount;
    } else {
      amount_withdrawn += Math.abs(trade.total_amount);
    }
    
    // Update first investment date if older 
    if (new Date(trade.date).getTime() < new Date(first_investment).getTime()) {
      first_investment = trade.date;
    }

    // update holding
    await updateHoldingById(holding.id, { 
      shares, 
      amount_invested, 
      amount_withdrawn, 
      first_investment,
    });

    // recalculate daily positions
    await updateHoldingPosition(holding.id)

  } catch (err) {
    logger.error(err);
  }
}

/**
 * Event listners
 */
em.on(EVENTS.TRADE.TRADE_CREATED, onTradeCreated)