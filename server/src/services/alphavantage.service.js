import axios from 'axios';
import config from '../config/config.js';
import httpStatus from 'http-status';
import logger from '../config/logger.js';
import ApiError from "../utils/ApiError.js";
import handleAxiosError from '../utils/handleAxiosError.js';
import _ from 'lodash';
import * as redis from '../libs/redis.js';

const API_KEY = config.alphavantageApiKey;

const URLS = {
  search: term => `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${term}&apikey=${API_KEY}`,
  overview: (symbol) => `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`,
  quote: (symbol) => `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`,
  dailyTimeSeries: (symbol) => `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}&outputsize=full`
}

const searchStockSymbols = async (term) => {
  const queryUrl = URLS.search(term);
  const cached = await redis.getKey(queryUrl);
  if (cached) return cached;
  
  const startTime = new Date();
  const response = await axios.get(queryUrl).then(r => r.data).catch(handleAxiosError);
  const results = []
  
  response?.bestMatches?.forEach(match => results.push({
    symbol: match['1. symbol'],
    name: match['2. name'],
    country: match['4. region'],
    currency: match['8. currency']
  }))

  logger.info(`Search stock ${term} returned ${results.length} results. Took ${new Date() - startTime}ms`);
  redis.setKey(queryUrl, results)
  return results;
}

/**
 * Get basic information about a company, like name and country.
 * 
 * @param {string} symbol 
 */
const getCompanyInformation = async (symbol) => {
  const queryUrl = URLS.overview(symbol);

  const cached = await redis.getKey(queryUrl);
  if (cached) return cached;

  const startTime = new Date();
  const response = await axios.get(queryUrl).then(r => r.data).catch(handleAxiosError);
  if (_.isEmpty(response)) throw new ApiError(httpStatus.NOT_FOUND, `Symbol ${symbol} not found`);
  
  logger.info(`Request for company information for ${symbol} done. Took ${new Date() - startTime}ms`);

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
  return data;
}

/**
 * Get the current price for a given stock
 * 
 * @param {string} symbol 
 */
const getCurrentPrice = async (symbol) => {
  const queryUrl = URLS.quote(symbol);

  const cached = await redis.getKey(queryUrl);
  if (cached) return Number(cached);

  const startTime = new Date();
  const response = await axios.get(queryUrl).then(r => r.data).catch(handleAxiosError)
  
  logger.info(`Request for current price for ${symbol} done. Took ${new Date() - startTime}ms`);

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

/**
 * Get the daily prices for a given stock symbol
 * 
 * @param {string} symbol 
 */
const getDailyTimeSeries = async (symbol) => {
  const queryUrl = URLS.dailyTimeSeries(symbol);

  const cached = await redis.getKey(queryUrl);
  if (cached) return cached;

  const startTime = new Date();
  const response = await axios.get(queryUrl).then(r => r.data).catch(handleAxiosError)
  const timeSeries = response['Time Series (Daily)'];
  if (!timeSeries) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error getting time series for stock ${symbol}`);

  logger.info(`Request for daily time series for ${symbol} done. Found ${Object.keys(timeSeries).length} prices. Took ${new Date() - startTime}ms`);

  const data = [];
  Object.keys(timeSeries).forEach(key => {
    data.push({
      symbol,
      date: key,
      open: Number(timeSeries[key]['1. open']),
      high: Number(timeSeries[key]['2. high']),
      low: Number(timeSeries[key]['3. low']),
      close: Number(timeSeries[key]['4. close']),
      adjusted_close: Number(timeSeries[key]['5. adjusted close']),
      volume: Number(timeSeries[key]['6. volume']),
      dividend_amount: Number(timeSeries[key]['7. dividend amount']),
      split_coeficient: Number(timeSeries[key]['8. split coefficient']),
    })
  })

  redis.setKey(queryUrl, data, 60 * 6) //exp. 6 hours
  return data;
}

export {
  searchStockSymbols,
  getCompanyInformation,
  getCurrentPrice,
  getDailyTimeSeries
}