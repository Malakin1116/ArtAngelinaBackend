import Joi from 'joi';

export const paintingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(1).required(),
});

export const updatePaintingSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  price: Joi.number().min(1),
  available: Joi.boolean(),
}).min(1);

export const merchSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(1).required(),
});

export const updateMerchSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(1).optional(),
  available: Joi.boolean().optional(),
}).min(1);