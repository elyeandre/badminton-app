const User = require('../models/User');
const { Buffer } = require('buffer');
const { error, log } = console;
const createError = require('http-errors');
const { sendOTP } = require('../services/emailService');

exports.verifyEmail = async (req, res, next) => {
  const { email: encodedEmail, otp } = req.body;

  try {
    // decode Base64 email
    const decodedEmail = Buffer.from(encodedEmail, 'base64').toString();

    // find the user by email
    const user = await User.findOne({ email: decodedEmail });
    if (!user) {
      // if the user is not found, return "User not found" error
      return res.status(404).json({ error: 'User not found' });
    }

    // convert both OTPs to strings and trim any whitespace
    const storedOtp = user.otp.toString().trim();
    const providedOtp = otp.toString().trim();

    // check if the OTP is valid
    if (storedOtp !== providedOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // check if OTP has expired
    const currentTime = Date.now();
    if (user.otpExpires && user.otpExpires < currentTime) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // if OTP is correct and not expired, mark email as verified
    user.isVerified = true;
    user.otp = null; // optionally clear OTP after successful verification
    user.otpExpires = null; // clear the expiration as well
    user.verificationToken = null;
    user.isTokenUsed = true;
    user.tokenExpires = null;

    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    error('Error during verification check:', err);
    next(createError(500, 'Internal Server Error'));
  }
};
