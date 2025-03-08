import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
} from '../controllers/cart.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.post('/add-to-cart', addToCart);
router.get('/', getCart);
router.delete('/:paintingId', removeFromCart);
router.post('/checkout', checkout);

export default router;
