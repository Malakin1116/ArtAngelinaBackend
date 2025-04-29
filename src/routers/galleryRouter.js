import express from 'express';
import { upload } from '../middlewares/multer.js';
import { addPainting, getAllPaintings, getPaintingById } from '../controllers/gallery.js';

const router = express.Router();

router.post('/', upload.single('image'), addPainting);
router.get('/', getAllPaintings);
router.get('/:id', getPaintingById); // Додаємо маршрут для отримання картини за ID

export default router;