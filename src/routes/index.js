const express = require('express');
const router = express.Router();
const path = require('path');

let routes = (app) => {
  router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/index.html'));
  });

  app.use('/', router);
};

module.exports = routes;
