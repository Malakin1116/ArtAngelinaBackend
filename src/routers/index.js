import { Router } from 'express';
import cartRouter from './cart.js';
import authRouter from './auth.js';

const router = Router();

router.use('/cart', cartRouter);
router.use('/auth', authRouter);

export default router;
