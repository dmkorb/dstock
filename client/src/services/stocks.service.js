import api from './api';

const URLS = {
  STOCKS: `/v1/stocks`,
  BENCHMARKS: `/v1/benchmarks`
}

const searchStocks = async term => {
  const response = await api.get(`${URLS.STOCKS}?term=${term}`)
  return response
}

const getBenchmarks = async (startDate) => {
  let query = startDate ? `start_date=${startDate}` : ''
  const response = await api.get(`${URLS.BENCHMARKS}?${query}`)
  return response
}

export const stocksService = {
  searchStocks,
  getBenchmarks
}