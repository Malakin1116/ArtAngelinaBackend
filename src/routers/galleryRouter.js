import express from 'express';
import { upload } from '../middlewares/multer.js';
import { addPainting } from '../controllers/gallery.js';

const router = express.Router();

router.post('/', upload.single('image'), addPainting);

export default router;
