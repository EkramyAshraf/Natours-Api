const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const AppError = require('../utils/appError');

const Stripe = require('stripe');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handleFactory');

const stripe = new Stripe(process.env.STRIPE_SECRET);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.checkoutSession = catchAsync(async (req, res, next) => {
  //1)get cart based on cartId
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('there is no tour for this ID', 400));
  }

  //2)create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          product_data: {
            name: `Order for ${req.user.name}`,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      tour.id
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
  });

  //4)send session to response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async (session) => {
  const tourId = session.client_reference_id;
  const price = session.amount_total / 100;

  //1)get cart based on cartId
  const user = await User.findOne({ email: session.customer_email });

  //2)create order with default payment type cash
  const booking = await Booking.create({
    user: user._id,
    tour: tourId,
    price,
  });
};
// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  let event;
  // Get the signature sent by Stripe
  const signature = req.headers['stripe-signature'];
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.sendStatus(400).send(`⚠️  Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await createBookingCheckout(event.data.object);

    res.status(200).json({
      received: true,
    });
  }
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
