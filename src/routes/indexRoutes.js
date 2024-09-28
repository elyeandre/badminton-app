const express = require('express');
const router = express.Router();
const path = require('path');
const serveFile = require('../utils/fileUtils');
const checkMongoConnection = require('../middleware/checkMongoConnection');
const checkVerificationToken = require('../middleware/checkVerificationToken');
const verifyToken = require('../middleware/authJwt');

let routes = (app) => {
  router.get('/', (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/index.html');
    serveFile(filePath, res, next);
  });

  // serve the registration page
  router.get('/register', checkMongoConnection, (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/signup.html');
    serveFile(filePath, res, next);
  });

  // serve the verification page
  router.get('/verification', checkMongoConnection, checkVerificationToken, async (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    req.user.isTokenUsed = true;
    await req.user.save();

    const filePath = path.resolve(__dirname, '../../build/verification.html');
    serveFile(filePath, res, next);
  });

  app.get('/test-redirect', (req, res) => {
    res.redirect('/some-other-route');
  });

  // serve the login page
  router.get('/login', checkMongoConnection, (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/signin.html');
    serveFile(filePath, res, next);
  });

  app.use('/', router);
};

module.exports = routes;
