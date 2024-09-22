module.exports = {
  db: process.env.DB_URI_DEV,
  jwtSecret: process.env.JWT_SECRET_DEV,
  host: process.env.HOST_DEV,
  port: process.env.PORT || 3000
};
