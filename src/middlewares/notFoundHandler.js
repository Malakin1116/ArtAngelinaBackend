import createHttpError from 'http-errors';

export const notFounderHandler = (req, res, next) => {
  next(createHttpError(404, 'Route not found'));
};
