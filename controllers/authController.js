const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url, 'welcome', 'welcome to our family').send();
  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide Email or Password', 400));
  }

  //check if user exist and password correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 400));
  }

  createSendToken(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1)Getting token and check if it is there
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, please login to get access', 401)
    );
  }
  // 2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('this user is no longer exists', 401));
  }

  //4)check if user change password after token
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently change password, please login again!', 401)
    );
  }

  //5)Grant Access to protected routes
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          'you don not have a permission to perform this Action!',
          403
        )
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on Email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('there is no user with that email!', 404));
  }

  //2) generate the random resetToken
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3)send it to user email
  const resetUrl = `${req.protocol}//${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await new Email(user, resetUrl, 'reset your password', message).send();
    createSendToken(user, 200, res);
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) if The token has not expired and user exists, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.save();

  // 3) Update changedPasswordAt property for the user

  //4)Log the user in, send JWT

  createSendToken(user, 200, res);
});

//update current user password
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from collection when is logged in
  const user = await User.findById(req.user.id).select('+password');
  console.log(user);
  //2)check if current password is correct
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return next(new AppError('your current password is wrong', 401));
  }

  //3)if so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4)Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};
