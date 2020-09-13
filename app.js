const express = require('express');
const morgan = require('morgan');
const transactionRoutes = require('./routes/transactionRouters');

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

module.exports = app;