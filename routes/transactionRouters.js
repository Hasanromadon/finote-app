const express = require('express');
const transactionController = require('../controllers/transactionsController');

const router = express.Router();


router.route('/top-5-expenses').get(transactionController.aliasTopExpenses, transactionController.getAllTransactions);
router.route('/report-data').get(transactionController.getTransactionStats);
router.route('/').get(transactionController.getAllTransactions).post(transactionController.createTransaction);

router.route('/:id').get(transactionController.getTransaction).patch(transactionController.updateTransaction).delete(transactionController.deleteTrasaction);

module.exports = router;