const express = require('express');
const router = express.Router();
const path = require('path');

let routes = (app) => {
  // Serve the registration page
  router.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/signup.html'));
  });

  // Serve the login page
  router.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/signin.html'));
  });

  app.use('/', router);
};

module.exports = routes;
