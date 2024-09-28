require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { generateOTP } = require('../utils/otpUtils');
const { error } = console;
const { log } = console;

const config = require('config');

exports.sendOTP = async (email) => {
  try {
    const otp = generateOTP(); // generate OTP using the utility
    const otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // store the OTP and expiration time in the database associated with the user
    await User.updateOne({ email }, { otp, otpExpires: otpExpiration }).exec();

    // configure nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.gmail.user,
        pass: config.gmail.pass
      }
    });

    const mailOptions = {
      from: config.gmail.user,
      to: email,
      subject: 'Email Verification',
      html: `
        <div style="text-align: center;">
          <img src="http://badminton-app.ap-1.evennode.com/assets/images/logo.png" alt="Logo" style="width: 100px; height: auto;" />
          <h2>Your OTP Code</h2>
          <p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        error('Error sending OTP:', err);
      } else {
        log('OTP sent:', info.response);
      }
    });
  } catch (err) {
    error('Error in sendOTP function:', err);
  }
};
