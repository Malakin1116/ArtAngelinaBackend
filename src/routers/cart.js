import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
  addMerchToCart,
  simulatePayment,
} from '../controllers/cart.js';
import { authenticate } from '../middlewares/authenticate.js';
import { OrderCollection } from '../db/models/Order.js';
import { PaymentCollection } from '../db/models/Payment.js';

const router = express.Router();

// Маршрут для оформлення замовлення доступний для всіх
router.post('/checkout', checkout);

// Маршрут для перевірки статусу замовлення
router.get('/order/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentCollection.findOne({ transactionId: paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const order = await OrderCollection.findById(payment.orderId)
      .populate('paintings.paintingId')
      .populate('merch.merchId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order status retrieved successfully',
      data: {
        orderId: order._id,
        status: order.status,
        paymentStatus: payment.paymentStatus,
        totalPrice: order.totalPrice,
        shippingDetails: order.shippingDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Маршрут для симуляції оплати
router.post('/simulate-payment/:paymentId', simulatePayment);

// Маршрути, які вимагають авторизації
router.use(authenticate);
router.post('/add-to-cart', addToCart);
router.post('/add-to-cart/merch', addMerchToCart);
router.get('/', getCart);
router.delete('/:paintingId', removeFromCart);

export default router;