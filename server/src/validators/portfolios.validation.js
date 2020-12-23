import Joi from '@hapi/joi';

const getPortfolios = {
  query: Joi.object().keys({
    name: Joi.string()
  })
}

const getPortfolio = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  })
}

const createPortfolio = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  })
}

const updatePortfolio = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
  })
}

const removePortfolio = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  })
}

export {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  removePortfolio
}