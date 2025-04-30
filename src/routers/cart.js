import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
  addMerchToCart,
} from '../controllers/cart.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Маршрут для оформлення замовлення доступний для всіх
router.post('/checkout', checkout);

// Маршрути, які вимагають авторизації
router.use(authenticate);
router.post('/add-to-cart', addToCart);
router.post('/add-to-cart/merch', addMerchToCart);
router.get('/', getCart);
router.delete('/:paintingId', removeFromCart);

export default router;