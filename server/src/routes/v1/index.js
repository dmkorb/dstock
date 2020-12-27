import express from 'express';
import { 
  portfolioController, 
  tradeController, 
  holdingsController, 
  authController,
  usersController, 
  stocksController
} from '../../controllers/index.js';
import { auth, isAdmin } from '../../middleware/auth.js';
import { portfolioValidator, tradeValidator, authValidator, userValidator } from '../../validators/index.js';
import validate from '../../middleware/validate.js';

const router = express.Router();

/**
 * Auth
 */
router.post('/auth/register', validate(authValidator.register), authController.register);
router.post('/auth/login', validate(authValidator.login), authController.login);
router.post('/auth/logout', validate(authValidator.logout), authController.logout);
router.post('/auth/refresh-tokens', validate(authValidator.refreshTokens), authController.refreshTokens);
router.post('/auth/forgot-password', validate(authValidator.forgotPassword), authController.forgotPassword);
router.post('/auth/reset-password', validate(authValidator.resetPassword), authController.resetPassword);

/**
 * Users
 */
router.get('/users', auth.required, validate(userValidator.getUsers), usersController.getUsers);
router.post('/users', auth.required, validate(userValidator.createUser), usersController.createUser)
router.get('/users/:userId', auth.required, validate(userValidator.getUser), usersController.getUser);
router.put('/users/:userId', auth.required, validate(userValidator.updateUser), usersController.updateUser);
router.delete('/users/:userId', auth.required, validate(userValidator.deleteUser), usersController.deleteUser);

/**
 * Portfolios
 */
router.get('/portfolios', auth.required, validate(portfolioValidator.getPortfolios), portfolioController.getPortfolios);
router.post('/portfolios', auth.required, validate(portfolioValidator.createPortfolio), portfolioController.createPortfolio);
router.get('/portfolios/:id', auth.required, validate(portfolioValidator.getPortfolio), portfolioController.getPortfolio);
router.get('/portfolios/:id/positions', auth.required, validate(portfolioValidator.getPortfolio), portfolioController.getPortfolioPosition);
router.put('/portfolios/:id', auth.required, validate(portfolioValidator.updatePortfolio), portfolioController.updatePortfolio);
router.delete('/portfolios/:id', auth.required, validate(portfolioValidator.removePortfolio), portfolioController.removePortfolio);

/**
 * Holdings
 */
router.get('/holdings', auth.required, holdingsController.getHoldings);
router.get('/holdings/:id', auth.required, holdingsController.getHolding);

/**
 * Trades
 */
router.get('/trades', auth.required, validate(tradeValidator.getTrades), tradeController.getTrades);
router.post('/trades', auth.required, validate(tradeValidator.createTrade), tradeController.createTrade);
router.put('/trades/:id', auth.required, validate(tradeValidator.updateTrade), tradeController.updateTrade);
router.delete('/trades/:id', auth.required, validate(tradeValidator.removeTrade), tradeController.removeTrade);

/**
 * Stocks
 */
router.get('/stocks', stocksController.getStocks)
router.get('/benchmarks', stocksController.getBenchmarks)

export default router;