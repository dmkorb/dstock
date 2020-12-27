import httpStatus from 'http-status';
import logger from '../config/logger.js';
import ApiError from "../utils/ApiError.js";
import { Portfolio } from "../models/index.js"
import { EVENTS } from '../constants/index.js';
import * as holdingsService from "./holdings.service.js";
import { getEventManager} from '../libs/event.manager.js';
import { calculateGainAndPerformance } from '../utils/calculators.js';

const em = getEventManager();

const doesPortfolioExist = async (portfolioId) => {
  const exists = await Portfolio.exists({ _id: portfolioId });
  if (!exists) throw new ApiError(httpStatus.NOT_FOUND, `Portfolio not found`);
}

const doesPortfolioBelongToUser = async (portfolioId, user_id) => {
  await doesPortfolioExist(portfolioId);
  const exists = await Portfolio.exists({ _id: portfolioId, user_id });
  if (!exists) {
    logger.error(`Access error: Portfolio ${portfolioId} doesn't belong to user ${user_id}`);
    throw new ApiError(httpStatus.FORBIDDEN, `Portfolio doesn't belong to this user`);
  }
}

const getPortfolios = async (filter = {}, options = {}) => {
  const limit = Number(options.limit || 50);
  const offset = Number(options.offset || 0);
  const total_count = await Portfolio.countDocuments(filter);
  const portfolios = await Portfolio.find(filter).sort({ created_at: -1 }).limit(limit).skip(offset)
  const count = portfolios.length;
  return { count, limit, offset, total_count, portfolios };
}

const getPortfolioById = async (portfolioId) => {
  const portfolio = await Portfolio.findById(portfolioId);
  if (!portfolio) throw new ApiError(httpStatus.NOT_FOUND, `Portfolio not found`);
  const holdings = await holdingsService.getHoldingsForPortfolioId(portfolioId);

  let equity = 0;
  let gains = 0;
  let performance = 0;
  let amount_invested = 0;
  let amount_withdrawn = 0;
  let first_investment = new Date();

  for (let hld of holdings) {
    if (hld.equity) equity += hld.equity;
    if (hld.amount_invested) amount_invested += hld.amount_invested;
    if (hld.amount_withdrawn) amount_withdrawn += hld.amount_withdrawn;
    if (new Date(hld.first_investment).getTime() < first_investment.getTime()) {
      first_investment = new Date(hld.first_investment);
    }
  }

  if (amount_invested > 0) {
    gains = (equity + amount_withdrawn - amount_invested);
    performance = (gains / amount_invested) * 100
  }

  const response = {
    ...portfolio.toJSON(),
    equity,
    gains,
    performance,
    amount_invested,
    amount_withdrawn,
    first_investment,
    holdings
  }

  return response;
}

const getPortfolioPositions = async (portfolioId) => {
  const portfolio = await getPortfolioById(portfolioId);
  const holdings = await holdingsService.getHoldingsForPortfolioId(portfolioId);

  const portflioPositions = []

  for (let hld of holdings) {
    const holdingPositions = await holdingsService.getUpdatedHoldingPositions(hld.id);

    console.log(`Holding ${hld.symbol} has ${holdingPositions.length} positions`)
    
    holdingPositions.forEach(pos => {
      let dailyPrtPosition = portflioPositions.find(d => d.date === pos.date);
      
      if (dailyPrtPosition) {
        dailyPrtPosition.equity += pos.equity;
        dailyPrtPosition.invested += pos.invested;
        dailyPrtPosition.withdrawn += pos.withdrawn;
      } else {
        dailyPrtPosition = {
          date: pos.date,
          equity: pos.equity,
          invested: pos.invested,
          withdrawn: pos.withdrawn
        }
      } 

      const { gains, performance } = calculateGainAndPerformance(
        dailyPrtPosition.equity, 
        dailyPrtPosition.invested,
        dailyPrtPosition.withdrawn)
      
      dailyPrtPosition.gains = gains;
      dailyPrtPosition.performance = performance;

      portflioPositions.push(dailyPrtPosition)
    })
  }

  let positions = portflioPositions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return positions;
}

const createPortfolio = async (data) => {
  const portfolio = await Portfolio.create(data);
  return portfolio;
}

const updatePortfolioById = async (portfolioId, data) => {
  await doesPortfolioExist(portfolioId)
  const portfolio = await Portfolio.findByIdAndUpdate(portfolioId, { $set: data }, { new: true });
  return portfolio;
}

const removePortfolioById = async (portfolioId) => {
  await doesPortfolioExist(portfolioId)
  await Portfolio.findByIdAndDelete(portfolioId);
}

export {
  doesPortfolioExist,
  doesPortfolioBelongToUser,
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolioById,
  removePortfolioById,
  getPortfolioPositions
}

/**
 * Event handlers
 */
// const onHoldingPositionsUpdated = async ({ holding }) => {
//   try {
//     logger.info(`Portfolios onHoldingPositionsUpdated handler - holding ID ${holding.id}`);
//     const portfolio = await getPortfolioById(holding.portfolio_id);
//     const holdings = await holdingsService.getHoldingsForPortfolioId(holding.portfolio_id);
//     console.log(`Found ${holdings.length} holdings for portfolio ${holding.portfolio_id}`);

//     const portoflioPositions = []
//     for (let hld of holdings) {
//       hld.positions.forEach(pos => {
//         let dailyPrtPosition = portfolio.positions.find(d => d.date === pos.date);
//         console.log('dailyPrtPosition before', dailyPrtPosition);
//         if (dailyPrtPosition) {
//           dailyPrtPosition.equity += pos.equity;
//           dailyPrtPosition.invested += pos.invested;
//           dailyPrtPosition.withdrawn += pos.withdrawn;
//         } else {
//           dailyPrtPosition = {
//             date: pos.date,
//             equity: pos.equity,
//             invested: pos.invested,
//             withdrawn: pos.withdrawn
//           }
//         } 

//         const { gains, performance } = calculateGainAndPerformance(
//           dailyPrtPosition.equity, 
//           dailyPrtPosition.invested,
//           dailyPrtPosition.withdrawn)
        
//         dailyPrtPosition.gains = gains;
//         dailyPrtPosition.performance = performance;

//         console.log('dailyPrtPosition after', dailyPrtPosition);

//         portoflioPositions.push(dailyPrtPosition)
//       })
//     }

//     // console.log('Portfolio positions:', portoflioPositions)
//     await updatePortfolioById(portfolio.id, { positions: portoflioPositions })
//   } catch (err) {
//     logger.error(err);
//   }
// }

const onUserCreatedEvent = async ({ user }) => {
  try {
    logger.info(`Portfolios service - onUserCreatedEvent handler - user ID ${user.id}`);
    const portfolio = await createPortfolio({name: `${user.name}'s portfolio`, user_id: user.id});
    logger.info(`Portfolios service - created portfolio ${portfolio.id} for user ${user.name} (${user.id})`);
  } catch (err) {
    logger.error(err);
  }
}

/**
 * Event listners
 */
// em.on(EVENTS.HOLDING.HOLDING_POSITIONS_UPDATED, onHoldingPositionsUpdated)
em.on(EVENTS.USER.USER_CREATED, onUserCreatedEvent)