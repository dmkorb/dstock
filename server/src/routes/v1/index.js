import express from 'express';
import { 
  portfolioController, 
  tradeController, 
  holdingsController, 
  authController,
  usersController 
} from '../../controllers/index.js';
import { portfolioValidator, tradeValidator, authValidator, userValidator } from '../../validators/index.js';
import validate from '../../middleware/validate.js';

const router = express.Router();
// const jwt = require('express-jwt');

router.post('/auth/register', validate(authValidator.register), authController.register);
router.post('/auth/login', validate(authValidator.login), authController.login);
router.post('/auth/logout', validate(authValidator.logout), authController.logout);
router.post('/auth/refresh-tokens', validate(authValidator.refreshTokens), authController.refreshTokens);
router.post('/auth/forgot-password', validate(authValidator.forgotPassword), authController.forgotPassword);
router.post('/auth/reset-password', validate(authValidator.resetPassword), authController.resetPassword);

router.get('/users', validate(userValidator.getUsers), usersController.getUsers);
router.post('/users', validate(userValidator.createUser), usersController.createUser)
router.get('/users/:userId', validate(userValidator.getUser), usersController.getUser);
router.put('/users/:userId', validate(userValidator.updateUser), usersController.updateUser);
router.delete('/users/:userId', validate(userValidator.deleteUser), usersController.deleteUser);

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