import express from 'express';
import { getAllMerch, getMerchById } from '../controllers/merch.js';

const router = express.Router();

router.get('/', getAllMerch);
router.get('/:id', getMerchById);

export default router;