import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from "../utils/ApiError.js";
import handleAxiosError from '../utils/handleAxiosError.js'
import _ from 'lodash';
import logger from '../config/logger.js';
import * as redis from '../libs/redis.js';
const API_KEY = '0YKITDLKRIY84WUZ';

const URLS = {
  overview: (symbol) => `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`,
  quote: (symbol) => `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
}

const getStockBySymbol = async (symbol) => {
  const queryUrl = URLS.overview(symbol);

  const cached = await redis.getKey(queryUrl);
  if (cached) return cached;

  const response = await axios.get(queryUrl).then(r => r.data).catch(handleAxiosError);
  if (_.isEmpty(response)) throw new ApiError(httpStatus.NOT_FOUND, `Symbol ${symbol} not found`);
  
  const data = {
       symbol: response.Symbol,
       asset_type: response.AssetType,
       name: response.Name,
       exchange: response.Exchange,
       currency: response.Currency,
       country: response.Country,
       sector: response.Sector,
       industry: response.Industry
  }

  redis.setKey(queryUrl, data)

  logger.info(`GET stock ${symbol}: ${JSON.stringify(data)}`)
  return data;
}

const getCurrentQuote = async (symbol) => {
  const queryUrl = URLS.quote(symbol);

  const cached = await redis.getKey(queryUrl);
  if (cached) return Number(cached);

  const response = await axios.get(queryUrl).then(r => r.data).catch(handleAxiosError)
  console.log('Quote response', symbol, response)
  const quotes = response['Global Quote'];
  if (!quotes) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error getting current quote for ${symbol}`)
  }

  const price = quotes["05. price"];
  if (!price || isNaN(price)) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Invalid quote for ${symbol}`)
  }

  redis.setKey(queryUrl, price, 60 * 24);

  return Number(price);
}

const getLastQuote = async (symbol) => {

}

const getTimeSeries = async (symbol) => {

}

export {
  getCurrentQuote,
  getStockBySymbol
}