const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const transactionRoutes = require('./routes/transactionRouters');
const userRouters = require('./routes/userRouters');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const app = express();

//tambahkan ini ke untuk mengambil data dibody / body parses
app.use(express.json());
//GLOBAL MIDDLEWARE

//security https header

app.use(helmet());

//development loging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(process.env.NODE_ENV);
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //allow 1 hundred request 100 in 1 hour
  message: 'too many request from this IP, please try again in a hour',
});

app.use('/api', limiter); //apply limiter in /api

//limit body parser size
app.use(express.json({ limit: '10kb' }));

//data sanitize againys noSql query
app.use(mongoSanitize());

//data sanitize
app.use(xss());

//prevent parameter polution
app.use(
  hpp({
    whitelist: ['expenses'],
  })
);

//ROUTER

app.use('/api/v1/finote/', transactionRoutes);
app.use('/api/v1/users/', userRouters);

//jika tidak ada url

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

//jika error operational

app.use(globalErrorHandler);

module.exports = app;
