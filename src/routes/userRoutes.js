const express = require('express');
const router = express.Router();
const path = require('path');
const roleChecker = require('../middleware/roleChecker');
const verifyToken = require('../middleware/authJwt');
const { getCurrentUser } = require('../controllers/userController');
const serveFile = require('../utils/fileUtils');

let routes = (app) => {
  router.get('/me', verifyToken, getCurrentUser);

  router.get('/dashboard', verifyToken, roleChecker(['player', 'coach']), (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/home.html');
    serveFile(filePath, res, next);
  });
  router.get('/edit-profile', verifyToken, roleChecker(['player', 'coach']), (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../build/userprofile.html');
    serveFile(filePath, res, next);
  });

  app.use('/user', router);
};

module.exports = routes;
