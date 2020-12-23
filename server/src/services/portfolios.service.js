import httpStatus from 'http-status';
import { Portfolio } from "../models/index.js"
import ApiError from "../utils/ApiError.js";

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
  return portfolio;
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