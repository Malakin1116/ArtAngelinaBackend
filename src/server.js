import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth.js';
import cartRouter from './routers/cart.js';
import galleryRouter from './routers/galleryRouter.js';
import adminRouter from './routers/adminRouter.js';
import merchRouter from './routers/merchRouter.js'; // Додаємо роут для мерчу
import paymentRouter from './routers/payment.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import { getEnvVar } from './utils/getEnvVar.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFounderHandler } from './middlewares/notFoundHandler.js';
import { UPLOAD_DIR } from './constants/index.js';
import { initMongoConnection } from './db/initMongoConnection.js';

export const setupServer = async () => {
  const app = express();

  try {
    await initMongoConnection();
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }

  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'https://localhost:5173',
        'https://artangelina.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(logger);

  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
  app.use('/gallery', galleryRouter);
  app.use('/admin/paintings', adminRouter);
  app.use('/merch', merchRouter); // Додаємо роут для мерчу
  app.use('/payment', paymentRouter);
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use('*', notFounderHandler);
  app.use(errorHandler);

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => console.log(`Server is running on port ${port}`));
};