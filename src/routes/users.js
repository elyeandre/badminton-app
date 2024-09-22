const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const createError = require('http-errors');

let routes = (app) => {
  // Serve the registration page
  router.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/signup.html'));
  });

  // Serve the login page
  router.get('/login', async (req, res, next) => {
    // check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // 1 indicates connected
      return next(createError(503, 'Service Unavailable.'));
    }

    try {
      res.sendFile(path.resolve(__dirname, '../../build/signin.html'));
    } catch (err) {
      next(createError(500, 'Internal Server Error'));
    }
  });

  app.use('/', router);
};

module.exports = routes;
