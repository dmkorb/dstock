import express from 'express';
import { portfolioController } from '../../controllers/index.js';
import { portfolioValidator } from '../../validators/index.js';
import validate from '../../middleware/validate.js';

const router = express.Router();
// const jwt = require('express-jwt');

router.get('/portfolios', validate(portfolioValidator.getPortfolios), portfolioController.getPortfolios);
router.post('/portfolios', validate(portfolioValidator.createPortfolio), portfolioController.createPortfolio);
router.get('/portfolios/:id', validate(portfolioValidator.getPortfolio), portfolioController.getPortfolio);
router.put('/portfolios/:id', validate(portfolioValidator.updatePortfolio), portfolioController.updatePortfolio);
router.delete('/portfolios/:id', validate(portfolioValidator.removePortfolio), portfolioController.removePortfolio);

export default router;