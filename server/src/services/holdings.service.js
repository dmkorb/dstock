import httpStatus from 'http-status';
import { EVENTS } from '../../constants/index.js';
import { getEventManager} from '../libs/event.manager.js';
import logger from '../config/logger.js';
import { Holding } from '../models/index.js';
import * as stocks from './stocks.service.js';

const em = getEventManager();

const doesHoldingForSymbolExist = async (symbol) => {
  // const
}

const doesHoldingExist = async (holdingId) => {
  const exists = await Holding.exists({ _id: holdingId });
  if (!exists) throw new ApiError(httpStatus.NOT_FOUND, `Holding not found`);
}

const getHoldingsForPortfolioId = async (portfolio_id) => {
  const rawHoldings = await Holding.find({ portfolio_id })
  const holdings = await Promise.all(rawHoldings.map(async holding => {
    const quote = await stocks.getCurrentQuote(holding.symbol).catch(() => {});
    if (!quote) return holding;

    const equity = holding.shares * quote;
    let performance = 0;
    let gains = 0;
    if(holding.amount_invested > 0) {
      gains = (equity + holding.amount_withdrawn - holding.amount_invested);
      performance = (gains / holding.amount_invested) * 100 
    }
    
    return { ...holding.toJSON(), quote, equity, gains, performance };
  }));
  return holdings;
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
  return trade;
}

export {
  getHoldingsForPortfolioId,
  getHoldingForSymbol,
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

  } catch (err) {
    logger.error(err);
  }
}

/**
 * Event listners
 */
em.on(EVENTS.TRADE.TRADE_CREATED, onTradeCreated)