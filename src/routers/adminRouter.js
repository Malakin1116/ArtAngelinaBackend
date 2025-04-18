import express from 'express';
import { addPainting, updatePainting, deletePainting, getAllPaintings } from '../controllers/admin.js';
import { authenticate } from '../middlewares/authenticate.js';
import { restrictToAdmin } from '../middlewares/restrictToAdmin.js';
import { upload } from '../middlewares/multer.js';
import { validateBody } from '../middlewares/validateBody.js';
import { paintingSchema, updatePaintingSchema } from '../validation/painting.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.use(authenticate);
router.use(restrictToAdmin);

router.post('/', upload.single('image'), validateBody(paintingSchema), ctrlWrapper(addPainting));
router.get('/', ctrlWrapper(getAllPaintings));
router.patch('/:id', upload.single('image'), validateBody(updatePaintingSchema), ctrlWrapper(updatePainting));
router.delete('/:id', ctrlWrapper(deletePainting));

export default router;