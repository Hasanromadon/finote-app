const express = require('express');
const morgan = require('morgan');
const transactionRoutes = require('./routes/transactionRouters');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const app = express();

//tambahkan ini ke untuk mengambil data dibody
app.use(express.json());
//GLOBAL MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(process.env.NODE_ENV);
}

//ROUTER


app.use('/api/v1/finote/', transactionRoutes);

//jika tidak ada url

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
})

//jika error operational

app.use(globalErrorHandler);






module.exports = app;