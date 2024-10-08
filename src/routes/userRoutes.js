const express = require('express');
const router = express.Router();
const path = require('path');
const roleChecker = require('../middleware/roleChecker');
const verifyToken = require('../middleware/authJwt');
const { getCurrentUser, getUserById, updateUserInfo, serveData } = require('../controllers/userController');
const serveFile = require('../utils/fileUtils');
const { validateUserId, validateUserInfo } = require('../middleware/validator');
const validateUpdateFields = require('../middleware/validateUpdateField');
const { createRateLimiter } = require('../middleware/rateLimiter');
const { checkFilePermissions } = require('../middleware/checkFilePermission');

const limiter = createRateLimiter(15 * 60 * 1000, 100);

let routes = (app) => {
  router.get('/me', verifyToken, getCurrentUser);

  router.get('/get-user/:id', verifyToken, validateUserId, getUserById);

  // route to serve files from R2
  router.get('/data/:filename', verifyToken, checkFilePermissions, limiter, serveData);

  router.put('/update', verifyToken, validateUpdateFields, validateUserInfo, updateUserInfo);

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
