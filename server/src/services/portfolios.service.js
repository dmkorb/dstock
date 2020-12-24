import httpStatus from 'http-status';
import { Portfolio } from "../models/index.js"
import ApiError from "../utils/ApiError.js";
import * as holdingsService from "./holdings.service.js";

const portfolioExists = async (portfolioId) => {
  const exists = await Portfolio.exists({ _id: portfolioId });
  if (!exists) throw new ApiError(httpStatus.NOT_FOUND, `Portfolio not found`);
}
const getPortfolios = async (filter = {}, options = {}) => {
  const limit = options.limit || 50;
  const offset = options.offset || 0;
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
    first_investment,
    holdings
  }

  return response;
}

const createPortfolio = async (data) => {
  const portfolio = await Portfolio.create(data);
  return portfolio;
}

const updatePortfolioById = async (portfolioId, data) => {
  await portfolioExists(portfolioId)
  const portfolio = await Portfolio.findByIdAndUpdate(portfolioId, { $set: data }, { new: true });
  return portfolio;
}

const removePortfolioById = async (portfolioId) => {
  await portfolioExists(portfolioId)
  await Portfolio.findByIdAndDelete(portfolioId);
}

export {
  portfolioExists,
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolioById,
  removePortfolioById
}