const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.statics.calcAvgRatingAndQuantity = async function (tourId) {
  const result = await this.aggregate([
    //1)get all reviews on specific productId
    {
      $match: { tour: tourId },
    },
    {
      //2)group reviews based on productId
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  console.log(result);
  if (result.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: result[0].avgRating,
      ratingsQuantity: result[0].ratingQuantity,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAvg: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAvgRatingAndQuantity(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAvgRatingAndQuantity(this.r.tour);
  }
});
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
