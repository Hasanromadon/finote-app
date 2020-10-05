const AppError = require('../utils/appError');

//transport weird mongo db error inti frendly message
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handledulicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value :  ${value} please use another value!`;
  return new AppError(message, 400);
};

const handlevalidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.massage);

  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

//handle JWT ERROR
const handleJWTError = err => new AppError('Invalid token, please login again!', 401);



//PRODUCTION SIMPLE ERROR FOR CLIENT
//DEVELOPMENT GET ERROR AS MUCH AS CAN

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //kalo tidak ada masalah di program jalankan ini
  if (res.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //ada masalah di program atau unknown jalankan ini agar tidak diketahui code yang error
  else {
    //Send console error
    console.error('ERROR');

    //send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went Error!',
    });
  }
};

// dengan mendeclarasikan err, req, express tau kalo ini untuk handle error
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //reasign new error
    let error = {
      ...err
    };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handledulicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handlevalidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    console.log(error);
    sendErrorProd(error, res);
  }
};