/* eslint-disable prettier/prettier */
const Transaction = require('../models/transactionsModel');
const APIFeatures = require('../utils/apiFeatures');
const {
    json
} = require('express');
//Handler

exports.aliasTopExpenses = async (req, res, next) => {
    req.query.limit = '5';
    req.query.category = 'Biaya'
    next();
}


exports.getAllTransactions = async (req, res) => {
    try {

        //Execute Query
        const features = new APIFeatures(Transaction.find(), req.query).filter().sort().limitFields().paginate();
        const transaction = await features.query;

        res.status(200).json({
            status: 'success',
            result: transaction.length,
            data: transaction
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

};
exports.getTransaction = async (req, res) => {
    try {

        const id = req.params.id;
        const transaction = await Transaction.findById(id);
        res.status(200).json({
            status: 'success',
            data: transaction
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }


};

exports.createTransaction = async (req, res) => {
    try {

        const newTransaction = await Transaction.create(req.body);
        res.status(201).json({

            status: 'mantap',
            data: {
                transaction: newTransaction
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

};

exports.deleteTrasaction = async (req, res) => {

    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }




};


exports.updateTransaction = async (req, res) => {

    try {

        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //return new data
            runValidators: true
        });

        res.status(201).json({
            status: 'success',
            data: transaction
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

};

exports.getTransactionStats = async (req, res) => {

    try {
        const stats = await Transaction.aggregate([{

            $match: {
                amount: {
                    $gt: 0
                }
            },
            $group: {
                _id: '$category',
                total: {
                    $sum: '$amount'
                }
            }
        }]);

        res.status(200).json({
            status: 'success',
            data: stats
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })

    }
}