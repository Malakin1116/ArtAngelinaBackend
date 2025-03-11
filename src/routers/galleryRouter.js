import express from 'express';
import { upload } from '../middlewares/multer.js';
import { addPainting, getAllPaintings } from '../controllers/gallery.js';

const router = express.Router();

router.post('/', upload.single('image'), addPainting);
router.get('/', getAllPaintings);

export default router;
