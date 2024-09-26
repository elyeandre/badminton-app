const fs = require('fs');
const path = require('path');

module.exports = {
  uri: process.env.DB_URI,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  tls: true,
  tlsCAFile: [path.join(__dirname, '../certs/evennode.pem')],
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000
};
