module.exports = {
  db: process.env.DB_URI_PROD,
  jwtSecret: process.env.JWT_SECRET_PROD,
  host: process.env.HOST_PROD,
  port: process.env.PORT || 3000
};
