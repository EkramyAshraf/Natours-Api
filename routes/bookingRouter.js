const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
router.use(authController.protect);
router.get('/checkout-session/:bookingId', bookingController.checkoutSession);
router.post('/:tourId', bookingController.createBooking);
router.route('/').get(bookingController.getAllBookings);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
