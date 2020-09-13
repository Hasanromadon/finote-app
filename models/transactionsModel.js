const mongoose = require('mongoose');

const transactionsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A transaction must have a name'],
        trim: true,
        minlength: [5, 'A name minimal 5 character']
    },
    transactionType: {
        type: String,
        required: [true, 'Transaction must have tipe']
    },
    category: {
        type: String,
        required: [true, 'transaction must have category'],
        enum: {
            values: ['investing', 'operatng', 'financing'],
            message: 'category is either : investing, operatng, financing'
        }
    },
    amount: {
        type: Number,
        required: [true, 'A transaction must have amount'],
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

const Transaction = mongoose.model('Transaction', transactionsSchema);

module.exports = Transaction;