import api from './api';

const URLS = {
  PORTFOLIOS: `/v1/portfolios`,
}

const getPortfolios = async () => {
  const response = await api.get(URLS.PORTFOLIOS)
  return response
}

const createPortfolio = async (data) => {
  const response = await api.post(URLS.PORTFOLIOS, data);
  return response;
}

const getPortfolio = async (portfolioId) => {
  const response = await api.get(`${URLS.PORTFOLIOS}/${portfolioId}`)
  return response;
}

const getPortfolioPositions = async (portfolioId) => {
  const response = await api.get(`${URLS.PORTFOLIOS}/${portfolioId}/positions`);
  return response;
}

const updatePortfolio = async (portfolioId, data) => {
  const response = await api.put(`${URLS.PORTFOLIOS}/${portfolioId}`, data)
  return response;
}

const removePortfolio = async (portfolioId) => {
  const response = await api.delete(`${URLS.PORTFOLIOS}/${portfolioId}`);
  return response;
}

export const portfoliosService = {
  getPortfolios,
  createPortfolio,
  getPortfolio,
  getPortfolioPositions,
  updatePortfolio,
  removePortfolio
}