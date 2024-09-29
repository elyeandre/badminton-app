const User = require('../models/User');
const { log, error } = console;
const createError = require('http-errors');

const checkVerificationToken = async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    // return res.redirect('/login');
    return next(createError(400, 'Verification token is required'));
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return next(createError(404, 'Invalid token'));
    }

    if (user.tokenExpires < Date.now()) {
      return next(createError(400, 'Verification token has expired'));
    }

    if (user.isTokenUsed) {
      return next(createError(400, 'Verification token has already been used'));
    }

    // token is valid, attach user info to request
    req.user = user; // attach user data if needed
    next(); // proceed to the next middleware
  } catch (err) {
    error('Error checking verification token:', err);
    return next(createError(500, 'Internal Server Error'));
  }
};

module.exports = checkVerificationToken;
