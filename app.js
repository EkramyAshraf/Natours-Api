const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
const { xss } = require('express-xss-sanitizer');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const dotenv = require('dotenv');
const { webhookCheckout } = require('./controllers/bookingController');
dotenv.config({ path: './config.env' });
const app = express();

//enable other domains to access the application
app.use(cors());

//compress all responses
app.use(compression());
// 1) GLOBAL MIDDLEWARES
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);
// Set security HTTP headers
app.use(helmet());
// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '20kb' }));
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Data sanitization against NoSQL query injection
// Data sanitization against XSS
app.use(expressMongoSanitize());
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.use((req, res, next) => {
  next(new AppError(`can’t find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
