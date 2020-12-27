import api from './api';

const HOLDINGS_URL = `/v1/holdings`;

const getHoldings = async () => {
  const response = await api.get(HOLDINGS_URL);
  return response;
}

const getHoldingById = async (holdingId) => {
  const response = await api.get(`${HOLDINGS_URL}/${holdingId}`);
  return response;
}

export const holdingsService = {
  getHoldings,
  getHoldingById,
}