/* eslint-disable import/newline-after-import */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env',
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//CONNECT TO DATA
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(console.log('Database is success connected'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on('UUnhandledRejection', err => {
  console.log(err.name, error.message);
  console.log('UNHANDLED REJECTION Shutting Down');
  server.close(() => {
    process.exit(1);
  })
});