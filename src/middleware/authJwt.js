const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createError = require('http-errors');
const config = require('config');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['cookie']; // Get the session cookie from the request header

    if (!authHeader) return next(createError(401, 'Unauthorized'));

    const cookie = authHeader.split('=')[1]; // Extract the token from the cookie

    jwt.verify(cookie, config.jwtSecret, async (err, decoded) => {
      if (err) {
        return next(createError(401, 'This session has expired. Please Login.'));
      }

      const { id } = decoded; // Get user id from the decoded token
      const user = await User.findById(id); // Find user by that `id`

      if (!user) {
        return next(createError(404, 'User not found.'));
      }

      const { password, verificationToken, isTokenUsed, tokenExpires, otp, otpExpires, ...data } = user._doc; // Exclude sensitive fields
      req.user = data; // put the user data into req.user
      next();
    });
  } catch (err) {
    console.error('Error occurred during token verification:', err);
    return next(createError(500, 'Internal Server Error'));
  }
};

module.exports = verifyToken;
