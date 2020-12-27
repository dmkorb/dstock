import api from './api';

const URLS = {
  TRADES: `/v1/trades`,
}

const getTrades = async () => {
  const response = await api.get(`${URLS.TRADES}?limit=1000`);
  return response;
}

const createTrade = async (data) => {
  const response = await api.post(URLS.TRADES, data);
  return response;
}

const updateTrade = async (tradeId, data) => {
  const response = await api.put(`${URLS.TRADES}/${tradeId}`, data);
  return response;
}

const removeTrade = async (tradeId) => {
  const response = await api.delete(`${URLS.TRADES}/${tradeId}`);
  return response;
}

export const tradesService = {
  getTrades,
  createTrade,
  updateTrade,
  removeTrade
}