const express = require('express');
const router = express.Router();
const path = require('path');
const checkMongoConnection = require('../middleware/checkMongoConnection');
const serveFile = require('../utils/fileUtils');
const { registerUser } = require('../controllers/userController');

let routes = (app) => {
  // serve the registration page
  router.get('/register', checkMongoConnection, (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/signup.html');
    serveFile(filePath, res, next);
  });

  // handle Registration
  router.post('/register', checkMongoConnection, registerUser, (req, res, next) => {});

  // serve the login page
  router.get('/login', checkMongoConnection, (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/signin.html');
    serveFile(filePath, res, next);
  });

  app.use('/', router);
};

module.exports = routes;
