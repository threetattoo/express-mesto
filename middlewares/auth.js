const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/authorization-error');

module.exports = (req, res, next) => {
  const cookie = req.cookies;

  if (!cookie) {
    throw new AuthorizationError('Требуется авторизация');
  }

  const token = cookie.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    throw new AuthorizationError('Требуется авторизация');
  }

  req.user = payload;

  next();
};
