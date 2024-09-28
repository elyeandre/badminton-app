const createError = require('http-errors');
const User = require('../models/User');
const { log, error } = console;
const { generateNewVerificationToken } = require('../utils/genVerificationToken');
const { Buffer } = require('buffer');

const { sendOTP } = require('../services/emailService');

exports.loginUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body; // Extract role from request body

    // find the user by username
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }

    // validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError(401, 'Invalid username or password.'));
    }

    // check if the user's role matches the specified role
    if (user.role !== role.toLowerCase()) {
      return next(createError(403, 'User role does not match the specified role.'));
    }

    // if the user is not verified, send verification data
    if (!user.isVerified) {
      const token = await generateNewVerificationToken(user.email); // generate a new verification token
      await sendOTP(user.email);
      const base64Email = Buffer.from(user.email).toString('base64');

      return res.status(200).json({
        success: true,
        action: 'verify',
        verificationUrl: `/verification?token=${token}&email=${base64Email}`
      });
    }

    let options = {
      maxAge: new Date(Date.now() + 5 * 60 * 1000), // would expire in 5 minutes
      httpOnly: true, // the cookie is only accessible by the web server
      // secure: true,
      sameSite: 'Lax'
    };

    const token = user.generateAccessJWT(); // generate session token for user
    res.cookie('SessionID', token, options); // set the token to response header

    return res.status(200).json({
      success: true,
      action: 'redirect',
      redirectUrl: `/test/${user.role.toLowerCase()}`
    });
  } catch (err) {
    error('Error occurred while logging the user:', err);
    return next(createError(500, 'Internal Server Error'));
  }
};
