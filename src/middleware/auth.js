const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findByPk(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
          });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        next(err);
      });
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired.'
        : 'Invalid token.';
    return res.status(401).json({
      success: false,
      message,
    });
  }
}

module.exports = { authenticateToken };
