const User = require('../models/User');
const createError = require('http-errors');
const { error, log } = console;
const { sendOTP } = require('../services/emailService');
const { generateNewVerificationToken } = require('../utils/genVerificationToken');
const { Buffer } = require('buffer');

exports.registerUser = async (req, res, next) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      username,
      password,
      confirm_password,
      gender,
      date_of_birth,
      municipality,
      contact_number,
      status_owner,
      role
    } = req.body;

    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // send a custom response for email already exists
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create a new user object
    const newUser = new User({
      first_name,
      middle_name,
      last_name,
      email,
      username,
      password,
      confirm_password,
      gender,
      date_of_birth,
      municipality,
      contact_number,
      status_owner,
      verificationToken: null,
      isTokenUsed: false,
      tokenExpires: null,
      isVerified: false,
      otp: null, // initialize OTP as null
      otpExpires: null, // initialize OTP expiration
      role,
      ...(role === 'Admin' && { status_owner })
    });

    // save the user to the database
    await newUser.save();

    const token = await generateNewVerificationToken(email);

    const base64Email = Buffer.from(email).toString('base64');

    await sendOTP(email);

    // verification page with  token
    return res.status(201).json({ redirectUrl: `/verification?token=${token}&email=${base64Email}` });
  } catch (err) {
    const isProduction = req.app.get('env') === 'production';

    // log the error for debugging purposes
    error('Error registering user:', err);

    // handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error) => error.message);

      // return generic message in production, detailed message in non-production
      if (isProduction) {
        return next(createError(400, 'Invalid input data.'));
      } else {
        return next(createError(400, validationErrors.join(', ')));
      }
    }

    // for all other types of errors, return a generic server error in production
    if (isProduction) {
      return next(createError(500, 'Internal Server Error'));
    } else {
      return next(createError(500, err.message));
    }
  }
};
