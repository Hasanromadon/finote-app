const Transaction = require('../models/transactionsModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//Handler

exports.aliasTopExpenses = async (req, res, next) => {
  req.query.limit = '5';
  req.query.category = 'Biaya';
  next();
};

exports.getAllTransactions = catchAsync(async (req, res) => {
  //Execute Query
  const features = new APIFeatures(Transaction.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const transaction = await features.query;

  res.status(200).json({
    status: 'success',
    result: transaction.length,
    data: transaction,
  });
});

exports.getTransaction = catchAsync(async (req, res, next) => {

  const transaction = await Transaction.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError(`No valid ID ${req.params.id}`, 404));
    }
  });

  if (!transaction) {
    return next(
      new AppError(`No tour found with that ID ${req.params.id}`, 404)
    );
  }




  res.status(200).json({
    status: 'success',
    data: transaction,
  });
});

exports.createTransaction = catchAsync(async (req, res) => {
  const newTransaction = await Transaction.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      transaction: newTransaction,
    },
  });
});

exports.deleteTrasaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);

  if (!transaction) {
    next(new AppError(`cant find transaction with that ID`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body, {
      new: true, //return new data
      runValidators: true,
    }
  );

  if (!transaction) {
    next(new AppError(`cant find transaction with that ID`, 404));
  }

  res.status(201).json({
    status: 'success',
    data: transaction,
  });
});

exports.getTransactionStats = catchAsync(async (req, res) => {
  const stats = await Transaction.aggregate([{
    $match: {
      amount: {
        $gt: 0,
      },
    },
    $group: {
      _id: '$category',
      total: {
        $sum: '$amount',
      },
    },
  }, ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});