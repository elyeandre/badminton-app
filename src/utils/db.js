const mongoose = require('mongoose');

const connectDB = async (dbConfig) => {
  try {
    await mongoose.connect(dbConfig.uri, {
      user: dbConfig.user,
      pass: dbConfig.password
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
