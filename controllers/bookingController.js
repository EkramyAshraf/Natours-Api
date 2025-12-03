const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const AppError = require('../utils/appError');

const Stripe = require('stripe');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handleFactory');

const stripe = new Stripe(process.env.STRIPE_SECRET);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

exports.checkoutSession = catchAsync(async (req, res, next) => {
  //1)get cart based on cartId
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    return next(new AppError('there is no booking for this ID', 400));
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
          unit_amount: booking.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      booking.tour.id
    }&user=${req.user._id}&price=${booking.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${
      booking.tour.slug
    }`,
    customer_email: req.user.email,
    client_reference_id: req.params.bookingId,
  });

  //4)send session to response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const booking = await Booking.create({
    tour: req.params.tourId,
    user: req.user._id,
    price: tour.price,
  });

  res.status(201).json({
    status: 'success',
    data: booking,
  });
});

const createCardOrder = async (session) => {
  const tourId = session.client_reference_id;
  const price = session.amount_total / 100;

  //1)get cart based on cartId
  const booking = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  //2)create order with default payment type cash
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  //4)after create order, increment product sold and decrement product quantity
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});
    //5) clear cart depend on cart Items
    await Cart.findByIdAndDelete(cartId);
  }
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
    return res.sendStatus(400).send(`⚠️  Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createCardOrder(event.data.object);

    res.status(200).json({
      received: true,
    });
  }
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
