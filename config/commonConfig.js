const path = require('path');

module.exports = {
  mongodb: {
    uri: process.env.DB_URI,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    tls: true,
    tlsCAFile: [path.join(__dirname, '../certs/evennode.pem')]
  },
  gmail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  port: process.env.PORT || 3000,
  disableSecurity: process.env.DISABLE_SECURITY
};
