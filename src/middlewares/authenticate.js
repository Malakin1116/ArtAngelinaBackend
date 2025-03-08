import createHttpError from 'http-errors';

import { getSession, getUser } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }
  const [bearer, accessToken] = authHeader.split(' ');

  if (bearer !== 'Bearer') {
    next(createHttpError(401, 'Auth header should be of type Bearer'));
    return;
  }

  const session = await getSession({ accessToken });

  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  if (isAccessTokenExpired) {
    next(createHttpError(401, 'Access token expired'));
  }
  const user = await getUser({ _id: session.userId });
  console.log(user);
  if (!user) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  req.user = user;
  next();
};
