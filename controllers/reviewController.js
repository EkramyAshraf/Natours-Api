const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    result: reviews.length,
    reviews,
  });
});

exports.getReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('No reviews found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    review,
  });
});

exports.createReview = catchAsync(async (req, res) => {
  if (req.params.tourId) {
    req.body.tour = req.params.tourId;
    req.body.user = req.user._id;
  }
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    newReview,
  });
});

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// };
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// };
