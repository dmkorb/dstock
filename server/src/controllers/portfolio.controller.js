import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import * as portfoliosService from '../services/portfolios.service.js';
import * as holdingsService from '../services/holdings.service.js';

const getPortfolios = catchAsync(async (req, res) => {
    const options = pick(req.query, ['limit', 'offset']);
    const filter = { user_id: req.user.id }
    const data = await portfoliosService.getPortfolios(filter, options);
    res.send(data);
});

const getPortfolio = catchAsync(async (req, res) => {
    const { id } = req.params;
    await portfoliosService.doesPortfolioBelongToUser(id, req.user.id);
    const portfolio = await portfoliosService.getPortfolioById(id);
    res.send(portfolio);
});

const getPortfolioPosition = catchAsync(async (req, res) => {
    const { id } = req.params;
    await portfoliosService.doesPortfolioBelongToUser(id, req.user.id);
    const positions = await portfoliosService.getPortfolioPositions(id);
    res.send({ id, positions });
})

const createPortfolio = catchAsync(async (req, res) => {
    const data = {
        ...req.body,
        user_id: req.user.id,
    }
    const portfolio = await portfoliosService.createPortfolio(data);
    res.send(portfolio);
});

const updatePortfolio = catchAsync(async (req, res) => {
    const { id } = req.params;
    await portfoliosService.doesPortfolioBelongToUser(id, req.user.id);
    const portfolio = await portfoliosService.updatePortfolioById(id, req.body)
    res.send(portfolio);
});

const removePortfolio = catchAsync(async (req, res) => {
    const { id } = req.params;
    await portfoliosService.doesPortfolioBelongToUser(id, req.user.id);
    await portfoliosService.removePortfolioById(id);
    res.send({ id: req.params.id, status: 'ok' });
});

export {
    getPortfolios,
    getPortfolio,
    getPortfolioPosition,
    createPortfolio,
    updatePortfolio,
    removePortfolio
}