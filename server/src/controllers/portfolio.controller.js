import catchAsync from '../utils/catchAsync.js';
import * as portfoliosService from '../services/portfolios.service.js';
import * as holdingsService from '../services/holdings.service.js';

const getPortfolios = catchAsync(async (req, res) => {
    const data = await portfoliosService.getPortfolios();
    res.send(data);
});

const getPortfolio = catchAsync(async (req, res) => {
    const portfolio = await portfoliosService.getPortfolioById(req.params.id);
    res.send(portfolio);
});

const createPortfolio = catchAsync(async (req, res) => {
    const portfolio = await portfoliosService.createPortfolio(req.body);
    res.send(portfolio);
});

const updatePortfolio = catchAsync(async (req, res) => {
    const portfolio = await portfoliosService.updatePortfolioById(req.params.id, req.body)
    res.send(portfolio);
});

const removePortfolio = catchAsync(async (req, res) => {
    await portfoliosService.removePortfolioById(req.params.id);
    res.send({ id: req.params.id, status: 'ok' });
});

export {
    getPortfolios,
    getPortfolio,
    createPortfolio,
    updatePortfolio,
    removePortfolio
}