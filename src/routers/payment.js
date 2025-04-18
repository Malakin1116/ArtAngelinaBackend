import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { initiateCryptoPayment } from '../controllers/payment.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.use(authenticate);

router.post('/crypto', ctrlWrapper(initiateCryptoPayment));

export default router;