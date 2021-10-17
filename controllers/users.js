const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const AuthorizationError = require('../errors/authorization-error');
const ExistingDataError = require('../errors/existing-data-error');
const IncorrectDataError = require('../errors/incorrect-data-error');
const NotFoundError = require('../errors/not-found-error');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (users.length === 0) {
        throw new NotFoundError('Пользователи не найдены');
      }
      res.status(200).send({ data: users });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с переданным _id не найден');
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new IncorrectDataError('Передан некорректный _id пользователя');
      }
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с переданным _id не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new IncorrectDataError('Передан некорректный _id пользователя');
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError('Произошла ошибка при валидации');
      }
      if (err.code === 11000) {
        throw new ExistingDataError(`Пользователь с таким email: ${req.body.email} существует`);
      }
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about },
    {
      runValidators: true,
      new: true,
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с переданным _id не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar },
    {
      runValidators: true,
      new: true,
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с переданным _id не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new NotFoundError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.status(200).send({ token });
    })
    .catch(() => {
      throw new AuthorizationError('Передан некорректный логин или пароль');
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
};
