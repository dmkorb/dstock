import express from 'express';
import { portfolioController, tradeController, holdingsController } from '../../controllers/index.js';
import { portfolioValidator, tradeValidator } from '../../validators/index.js';
import validate from '../../middleware/validate.js';

const router = express.Router();
// const jwt = require('express-jwt');

router.get('/portfolios', validate(portfolioValidator.getPortfolios), portfolioController.getPortfolios);
router.post('/portfolios', validate(portfolioValidator.createPortfolio), portfolioController.createPortfolio);
router.get('/portfolios/:id', validate(portfolioValidator.getPortfolio), portfolioController.getPortfolio);
router.get('/portfolios/:id/positions', validate(portfolioValidator.getPortfolio), portfolioController.getPortfolioPosition);
router.put('/portfolios/:id', validate(portfolioValidator.updatePortfolio), portfolioController.updatePortfolio);
router.delete('/portfolios/:id', validate(portfolioValidator.removePortfolio), portfolioController.removePortfolio);

router.get('/holdings', holdingsController.getHoldings);
router.get('/holdings/:id', holdingsController.getHolding);
router.get('/holdings/:id/profit', holdingsController.getHoldingProfit);

router.get('/trades', validate(tradeValidator.getTrades), tradeController.getTrades);
router.post('/trades', validate(tradeValidator.createTrade), tradeController.createTrade);
router.put('/trades/:id', validate(tradeValidator.updateTrade), tradeController.updateTrade);
router.delete('/trades/:id', validate(tradeValidator.removeTrade), tradeController.removeTrade);

export default router;