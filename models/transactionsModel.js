const mongoose = require('mongoose');
const User = require('./usersModel');

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
            values: ['investing', 'operating', 'financing'],
            message: 'category is either : investing, operating, financing'
        }
    },
    amount: {
        type: Number,
        required: [true, 'A transaction must have amount'],
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must belong to a user']
    }

});

// transactionsSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'user',
//         select: 'name'
//     })

//     next();
// })

const Transaction = mongoose.model('Transaction', transactionsSchema);

module.exports = Transaction;