// const jwt = require('express-jwt');
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import passport from 'passport'

const authenticate = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if ((err || info || !user) && !req.authOptional) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      }
      req.user = user;
      resolve();
    })(req, res, next);
    
  })
    .then(() => next())
    .catch((err) => next(err));
};

const optional = (req, res, next) => {
  req.authOptional = true;
  return authenticate(req, res, next);
}

export const isAdmin = async (req, res, next) => {
  return false;
}

export const auth = {
  optional,
  required: authenticate,
};
