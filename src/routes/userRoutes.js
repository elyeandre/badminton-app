const express = require('express');
const router = express.Router();
const checkMongoConnection = require('../middleware/checkMongoConnection');
const { registerUser } = require('../controllers/userController');
const { validateRegistration } = require('../middleware/userRegValidator');
const { validateLogin } = require('../middleware/loginValidator');
const { validateVerify } = require('../middleware/userVerifyValidator');
const { verifyEmail } = require('../controllers/verificationController');
const { loginUser } = require('../controllers/authController');

let routes = (app) => {
  // handle the verification
  router.post('/verify', checkMongoConnection, validateVerify, verifyEmail);

  // handle Registration
  router.post('/register', checkMongoConnection, validateRegistration, registerUser);

  // handle login
  router.post('/login', checkMongoConnection, validateLogin, loginUser);

  app.use('/user', router);
};

module.exports = routes;
