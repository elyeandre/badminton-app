const express = require('express');
const router = express.Router();
const path = require('path');
const serveFile = require('../utils/fileUtils');

let routes = (app) => {
  router.get('/', (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/index.html');
    serveFile(filePath, res, next);
  });

  app.use('/', router);
};

module.exports = routes;
