const jwt = require('jsonwebtoken');
const {
  promisify
} = require('util');
const User = require('../models/usersModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({
      id,
    },
    process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  //Remove the password from ouput



  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    //agar tidak ada yang input data semaunya
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  //check if and email and password exist
  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  //check email if exist
  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('Incorrect email and password', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //getting token and check of it's  there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('Your are not logged in! please log in to get access', 401)
    );
  }
  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // check if user  still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        `Then user belonging to this token doesn't longer exist`,
        401
      )
    );
  }

  //check if user changed password after the token was issued
  console.log(freshUser.changePasswordAfter(decoded.iat));

  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login again', 401)
    );
  }

  //grant access to protected route
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perfom this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on posted email

  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(new AppError('there is no user with that email', 404));
  }

  //generate the random reset token

  const resetToken = user.createPasswordToken();
  //simpan token dipassword
  await user.save({
    validateBeforeSave: false,
  });

  //send it to email
  //req.protocol = http / https
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? submit a patch request with a patch request with your new 
    password and password confirm to : ${resetURL}.\nif you didnot forget your password, please ignore this email`;

  try {
    await sendEmail({
      mail: user.email,
      subject: 'Your password reset token valid for 10 min',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token send email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError('There was an error sending the email. try again', 500)
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //find user with token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  //if token has not expired, and there is user. set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //delete token
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //update password change at (ada di middleware model presave)

  createSendToken(user, 201, res);
};

//Update Password
exports.updatePassword = async (req, res, next) => {
  //get user from collection
  const user = await User.findById(req.user.id).select('+password'); //explisitly ask for password
  //check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //if so, update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); /// kalo pave saveupdate makan middleware nya tidak akan berfungsi
  //log user in, send JWT

  createSendToken(user, 201, res);
};