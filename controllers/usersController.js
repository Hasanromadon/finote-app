const User = require('../models/usersModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');



exports.getAllUser = catchAsync(async (req, res) => {

    const user = await User.find();

    res.status(200).json({
        status: 'success',
        result: user.length,
        data: user,
    });

});