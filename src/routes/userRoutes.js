const express = require('express');
const router = express.Router();
const roleChecker = require('../middleware/roleChecker');
const User = require('../models/User'); // import the User model
const verifyToken = require('../middleware/authJwt');
const createError = require('http-errors');

let routes = (app) => {
  // Test endpoint for admin only
  router.get('/admin', verifyToken, roleChecker(['admin']), async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id); // Use req.user.id
  router.get('/me', verifyToken, getCurrentUser);

      const { password, verificationToken, isTokenUsed, tokenExpires, otp, otpExpires, ...data } = user._doc; // Exclude sensitive fields

      res.status(200).json({
        message: 'Admin access granted!',
        userRole: req.user.role,
        userData: data
      });
    } catch (err) {
      return next(createError(500, 'Internal Server Error'));
    }
  });

  // Test endpoint for player only
  router.get('/player', verifyToken, roleChecker(['player']), async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const { password, verificationToken, isTokenUsed, tokenExpires, otp, otpExpires, ...data } = user._doc; // Exclude sensitive fields

      res.status(200).json({
        message: 'Player access granted!',
        userRole: req.user.role,
        userData: data
      });
    } catch (err) {
      return next(createError(500, 'Internal Server Error'));
    }
  });

  // Test endpoint for coach only
  router.get('/coach', verifyToken, roleChecker(['coach']), async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const { password, verificationToken, isTokenUsed, tokenExpires, otp, otpExpires, ...data } = user._doc; // exclude sensitive fields

      res.status(200).json({
        message: 'Coach access granted!',
        userRole: req.user.role,
        userData: data
      });
    } catch (err) {
      return next(createError(500, 'Internal Server Error'));
    }
  });

  app.use('/test', router);
};

module.exports = routes;
