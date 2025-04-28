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

router.use(authenticate);

router.post('/add-to-cart', addToCart);
router.post('/add-to-cart/merch', addMerchToCart); // Додаємо маршрут для мерчу
router.get('/', getCart);
router.delete('/:paintingId', removeFromCart);
router.post('/checkout', checkout);

export default router;