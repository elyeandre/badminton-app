const User = require('../models/User');
const bcrypt = require('bcrypt');
const createError = require('http-errors');

exports.registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password, gender, dateOfBirth, municipality, contactNumber } =
      req.body;

    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(400, 'Email already exists'));
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      gender,
      dateOfBirth,
      municipality,
      contactNumber
    });

    // save the user to the database
    await newUser.save();

    // send a success response (you can also generate a token here)
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    next(createError(500, 'Internal Server Error'));
  }
};
