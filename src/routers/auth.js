import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUserSchema, loginUserSchema, requestResetEmailSchema, resetPasswordSchema, googleOAuthSchema } from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  getGoogleOAthUrlController,
  loginWithGoogleController,
  requestResetEmailController,
  resetPasswordController,
  registerAdminController, // Додаємо контролер
  getCurrentUserController, // Додаємо контролер
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { restrictToAdmin } from '../middlewares/restrictToAdmin.js';

const authRouter = Router();

authRouter.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerUserController));

authRouter.post('/login', validateBody(loginUserSchema), ctrlWrapper(loginUserController));

authRouter.post('/logout', ctrlWrapper(logoutUserController));

authRouter.post('/refresh', ctrlWrapper(refreshUserSessionController));

authRouter.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

authRouter.post(
  '/confirm-oauth',
  validateBody(googleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

authRouter.get('/get-oauth-url', ctrlWrapper(getGoogleOAthUrlController));

// Новий маршрут для створення адміністратора
authRouter.post(
  '/register-admin',
  authenticate,
  restrictToAdmin,
  validateBody(registerUserSchema),
  ctrlWrapper(registerAdminController),
);

// Новий маршрут для отримання поточного користувача
authRouter.get('/current', authenticate, ctrlWrapper(getCurrentUserController));

export default authRouter;