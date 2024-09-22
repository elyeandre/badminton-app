const commonConfig = require('./commonConfig');

module.exports = {
  ...commonConfig,
  host: process.env.HOST_PROD || '0.0.0.0'
};
