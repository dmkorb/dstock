import { EVENTS } from '../constants/index.js';
import { getEventManager } from '../events/event.manager.js';
import logger from '../config/logger.js';
import {
  getHoldingForSymbol,
  createHolding,
  updateHoldingById,
  updateHoldingPosition
} from '../services/holdings.service.js';

const em = getEventManager();


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

    const dataToUpdate = { 
      shares, 
      amount_invested, 
      amount_withdrawn, 
      first_investment,
    }

    logger.info(`Updating holding ${holding.id} with data ${JSON.stringify(dataToUpdate)}`)
    // update holding
    await updateHoldingById(holding.id, dataToUpdate);

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