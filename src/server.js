import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth.js';
import cartRouter from './routers/cart.js';
import galleryRouter from './routers/galleryRouter.js';
import adminRouter from './routers/adminRouter.js';
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

  await initMongoConnection();

  // Налаштування CORS
  app.use(
    cors({
      origin: 'http://localhost:5173', // Дозволяємо фронтенд
      credentials: true, // Дозволяємо cookies
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Дозволені методи
      allowedHeaders: ['Content-Type', 'Authorization'], // Дозволені заголовки
    })
  );

  // Обробка preflight запитів (OPTIONS)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use(logger);

  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
  app.use('/gallery', galleryRouter);
  app.use('/admin/paintings', adminRouter);
  app.use('/payment', paymentRouter);
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use('*', notFounderHandler);
  app.use(errorHandler);

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => console.log(`Server is running on port ${port}`));
};