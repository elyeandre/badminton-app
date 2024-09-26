const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const createError = require('http-errors');
const serveFile = require('../utils/fileUtils');

let routes = (app) => {
  // serve the registration page
  router.get('/register', checkMongoConnection, (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/signup.html');
    serveFile(filePath, res, next);
  });

  // Serve the login page
  router.get('/login', async (req, res, next) => {
    // check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // 1 indicates connected
      return next(createError(503, 'Service Unavailable.'));
    }

  // serve the login page
  router.get('/login', checkMongoConnection, (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/signin.html');
    serveFile(filePath, res, next);
  });

  app.use('/', router);
};

module.exports = routes;
