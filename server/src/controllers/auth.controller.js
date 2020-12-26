import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { authService, usersService, tokenService/*, emailService*/ } from '../services/index.js';

const register = catchAsync(async (req, res) => {
  const user = await usersService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ ...user.toJSON(), ...tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ ...user.toJSON(), ...tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refresh_token);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refresh_token);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  // await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
