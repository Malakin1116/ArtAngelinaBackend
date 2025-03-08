import Joi from 'joi';
import { UsersCollection } from '../db/models/user.js';
import { emailRegexp } from '../constants/index.js';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(4).required(),
});

export const registerUser = async (payload) => {
  return await UsersCollection.create(payload);
};

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});

export const googleOAuthSchema = Joi.object({
  code: Joi.string().required(),
});
