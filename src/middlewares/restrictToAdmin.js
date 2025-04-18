import createHttpError from 'http-errors';

export const restrictToAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw createHttpError(403, 'Access denied. Admin only.');
  }
  next();
};