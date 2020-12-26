import express from "express";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import passport from "passport";
import httpStatus from "http-status";
import config from "./config/config.js";
import morgan from "./config/morgan.js";
import routesV1 from "./routes/v1/index.js";
import routesAdmin from "./routes/admin/index.js";
import { jwtStrategy } from './config/passport.js';
import { errorConverter, errorHandler } from "./middleware/error.js";
import ApiError from "./utils/ApiError.js";

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/v1/auth', authLimiter);
// }

// v1 api routes
app.use("/v1", routesV1);
app.use("/admin", routesAdmin);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(
    new ApiError(httpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`)
  );
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
