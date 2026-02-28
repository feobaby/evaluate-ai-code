const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function signUp(req, res, next) {
  try {
    const { email, password, fullName } = req.validated;

    const existing = await User.findOne({
      where: { email: { [Op.iLike]: email } },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      email,
      password,
      fullName,
    });

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: user.toSafeObject ? user.toSafeObject() : user.get({ plain: true }),
        token,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    next(err);
  }
}

async function signIn(req, res, next) {
  try {
    const { email, password } = req.validated;

    const user = await User.scope('withPassword').findOne({
      where: { email: { [Op.iLike]: email } },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toSafeObject ? user.toSafeObject() : user.get({ plain: true }),
        token,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject ? user.toSafeObject() : user.get({ plain: true }),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signUp, signIn, getMe, generateToken };
