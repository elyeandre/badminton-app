const express = require('express');
const router = express.Router();
const checkMongoConnection = require('../middleware/checkMongoConnection');
const { validateRegistration } = require('../middleware/userRegValidator');
const { validateLogin } = require('../middleware/loginValidator');
const { validateVerify } = require('../middleware/userVerifyValidator');
const verifyToken = require('../middleware/authJwt');

const { loginUser, logoutUser, refreshToken, registerUser, verifyEmail } = require('../controllers/authController');

let routes = (app) => {
  // handle the verification
  router.post('/verify', checkMongoConnection, validateVerify, verifyEmail);

  // handle Registration
  router.post('/register', checkMongoConnection, validateRegistration, registerUser);

  // handle login
  router.post('/login', checkMongoConnection, validateLogin, loginUser);

  // handle logout
  router.post('/logout', checkMongoConnection, verifyToken, logoutUser);

  // handle logout
  router.post('/refresh', checkMongoConnection, refreshToken);

  app.use('/auth', router);
};

module.exports = routes;
