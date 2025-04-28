import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { restrictToAdmin } from '../middlewares/restrictToAdmin.js';
import { upload } from '../middlewares/multer.js';
import { validateBody } from '../middlewares/validateBody.js';
import { paintingSchema, updatePaintingSchema, merchSchema, updateMerchSchema } from '../validation/painting.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  addPainting,
  updatePainting,
  deletePainting,
  getAllPaintings,
  addMerch,
  getAllMerch,
  updateMerch,
  deleteMerch,
} from '../controllers/admin.js';

const router = express.Router();

router.use(authenticate);
router.use(restrictToAdmin);

// Маршрути для картин
router.post('/', upload.single('image'), validateBody(paintingSchema), ctrlWrapper(addPainting));
router.get('/', ctrlWrapper(getAllPaintings));
router.patch('/:id', upload.single('image'), validateBody(updatePaintingSchema), ctrlWrapper(updatePainting));
router.delete('/:id', ctrlWrapper(deletePainting));

// Маршрути для мерчу
router.post('/merch', upload.single('image'), validateBody(merchSchema), ctrlWrapper(addMerch));
router.get('/merch', ctrlWrapper(getAllMerch));
router.patch('/merch/:id', upload.single('image'), validateBody(updateMerchSchema), ctrlWrapper(updateMerch));
router.delete('/merch/:id', ctrlWrapper(deleteMerch));

export default router;