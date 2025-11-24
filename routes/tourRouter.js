const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRouter');
const authController = require('../controllers/authController');

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .patch(tourController.updateTour)
  .get(authController.protect, tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
