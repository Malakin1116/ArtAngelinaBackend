import { THIRTY_DAYS } from '../constants/index.js';
import { generateOAuthUrl } from '../utils/googleOAuth2.js';
import {
  logoutUser,
  loginUser,
  registerUser,
  refreshUsersSession,
  requestResetToken,
  resetPassword,
  loginOrRegisterWithGoogle,
} from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  console.log('Cookies set for session:', session._id);
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  const userObject = user.toObject();
  delete userObject.password;
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: userObject,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  setupSession(res, session);
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
  console.log('Cookies received in refresh request:', req.cookies);
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  setupSession(res, session);
  console.log('hello');
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email has been successfully sent.',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password has been successfully reset.',
    status: 200,
    data: {},
  });
};

export const getGoogleOAthUrlController = async (req, res) => {
  const url = generateOAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAth url',
    data: { url },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const { code } = req.body;
  const session = await loginOrRegisterWithGoogle(code);
  setupSession(res, session);
  res.json({
    status: 200,
    message: 'Successfully loginWithGoogleOAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const getCurrentUserController = async (req, res) => {
  const user = req.user; // Отримуємо користувача з authenticate middleware
  res.json({
    status: 200,
    message: 'User retrieved successfully',
    data: user,
  });
};

// Новий контролер для створення адміністратора
export const registerAdminController = async (req, res) => {
  const user = await registerUser({ ...req.body, role: 'admin' });
  const userObject = user.toObject();
  delete userObject.password;
  res.status(201).json({
    status: 201,
    message: 'Successfully registered an admin!',
    data: userObject,
  });
};