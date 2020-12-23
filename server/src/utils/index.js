import httpStatus from 'http-status';
import catchAsync from './catchAsync.js';

const TODO = catchAsync(async (req, res) => { res.status(httpStatus.OK).send({ route: req.originalUrl, message: 'TODO' }) })

export {
    TODO
}