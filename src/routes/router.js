const express = require('express');
const router = express.Router();
const path = require('path');

let routes = (app) => {
  // Testing
  router.get('/hi', (req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/index.html'));
  });

  router.get('/signin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/signin.html'));
  });

  router.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/signup.html'));
  });

  app.use('/', router);
};

module.exports = routes;
