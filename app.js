const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError');
const transactionRoutes = require('./routes/transactionRouters');
const AppError = require('./utils/appError');

const app = express();

//tambahkan ini ke untuk mengambil data dibody
app.use(express.json());
//GLOBAL MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(process.env.NODE_ENV);
}



app.all('*', (req, res, next) => {
    next(new AppError);
})
//ROUTER


app.use((err, req, res, next) => {
    console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })


})



app.use('/api/v1/finote/', transactionRoutes);

module.exports = app;