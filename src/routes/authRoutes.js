const express = require('express');
const router = express.Router();
const checkMongoConnection = require('../middleware/checkMongoConnection');
const { validateRegistration } = require('../middleware/userRegValidator');
const { validateLogin } = require('../middleware/loginValidator');
const { validateVerify } = require('../middleware/userVerifyValidator');
const {
  validateVerify,
  validateLogin,
  validateRegistration,
  validateForgotPassword
} = require('../middleware/validator');
const verifyToken = require('../middleware/authJwt');
const {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  verifyEmail,
  deleteAccount,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

let routes = (app) => {
  // handle the verification
  router.post('/verify', checkMongoConnection, validateVerify, verifyEmail);

  // handle Registration
  router.post('/register', checkMongoConnection, validateRegistration, registerUser);

  // handle login
  router.post('/login', checkMongoConnection, validateLogin, loginUser);

  // handle logout
  router.post('/logout', checkMongoConnection, verifyToken, logoutUser);

  // handle refresh token
  router.post('/refresh', checkMongoConnection, refreshToken);

  // handle account deletion
  router.post('/delete', checkMongoConnection, verifyToken, deleteAccount);

  // handle account forgot-password
  router.post('/forgot-password', checkMongoConnection, validateForgotPassword, forgotPassword);

  // handle account forgot-password
  router.post('/reset-password', checkMongoConnection, validateForgotPassword, resetPassword);

  app.use('/auth', router);
};

module.exports = routes;
