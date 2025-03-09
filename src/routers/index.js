import { Router } from 'express';
import cartRouter from './cart.js';
import authRouter from './auth.js';
import galleryRouter from './galleryRouter.js';

const router = Router();

router.use('/cart', cartRouter);
router.use('/auth', authRouter);
router.use('/gallery', galleryRouter);

export default router;
