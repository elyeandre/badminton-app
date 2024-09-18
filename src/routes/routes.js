const express = require('express');
const router = express.Router();
const path = require('path');

let routes = (app) => {
  // Serve the homepage
  router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/index.html'));
  });

  // Serve the sign-up page
  router.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/html/signUp.html'));
  });

  router.get('/signin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/signin.html'));
  });

  app.use(router);
};

module.exports = routes;
