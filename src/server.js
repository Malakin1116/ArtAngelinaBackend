import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth.js';
import cartRouter from './routers/cart.js';
import galleryRouter from './routers/galleryRouter.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import { getEnvVar } from './utils/getEnvVar.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFounderHandler } from './middlewares/notFoundHandler.js';
import { UPLOAD_DIR } from './constants/index.js';
import { initMongoConnection } from './db/initMongoConnection.js'; // Змінили connect.js на initMongoConnection.js

export const setupServer = async () => {
  const app = express();

  await initMongoConnection(); // Змінили connectDB на initMongoConnection

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(logger);

  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
  app.use('/gallery', galleryRouter);
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use('*', notFounderHandler);
  app.use(errorHandler);

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => console.log(`Server is running on port ${port}`));
};