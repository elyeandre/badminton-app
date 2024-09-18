const express = require('express');
const router = express.Router();
const path = require('path');

let routes = (app) => {
  // Testing
  router.get('/hi', (req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../src/html/index.html'));
  });

  app.use(router);
};

module.exports = routes;
