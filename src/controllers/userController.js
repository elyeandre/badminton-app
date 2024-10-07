const User = require('../models/User');
const { log, error } = console;
const config = require('config');
const { uploadToR2, deleteFromR2 } = require('../services/r2Service');

exports.getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    error('Error occurred while fetching current user:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};
