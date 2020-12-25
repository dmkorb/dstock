import Joi from '@hapi/joi';
import { TRADE_TYPES} from '../../constants/index.js';

const getTrades = {

}

const createTrade = {
  body: Joi.object().keys({
    symbol: Joi.string().required(),
    // name: Joi.string().required(),
    date: Joi.string().required(),
    quantity: Joi.number().required().greater(0),
    unit_price: Joi.number().required().greater(0),
    trade_type: Joi.string().required(),//.valid(Object.values(TRADE_TYPES)),
    portfolio_id: Joi.string().required(),
    broker_name: Joi.string(),
    brokerage: Joi.number().default(0),
  })
}

const updateTrade = {

}

const removeTrade = {

}

export {
  getTrades,
  createTrade,
  updateTrade,
  removeTrade
}