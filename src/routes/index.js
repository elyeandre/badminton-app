const express = require('express');
const router = express.Router();
const path = require('path');

let routes = (app) => {
  // Testing
  router.get('/', (req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  app.use(router);
};

module.exports = routes;
