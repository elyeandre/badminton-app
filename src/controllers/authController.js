const User = require('../models/User');
const { log, error } = console;
const { generateAccessAndRefreshTokens, generateNewVerificationToken } = require('../utils/generateToken');
const { addToBlacklist, isTokenBlacklisted } = require('../utils/blackListUtils');
const config = require('config');
const jwt = require('jsonwebtoken');
const { Buffer } = require('buffer');
const { sendOTP, sendForgotPasswordEmail } = require('../services/emailService');
const crypto = require('crypto');

exports.loginUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // check if username and password are provided
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'username, password and role are required'
      });
    }

    // find the user by username
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: 'User not found.'
      });
    }

    // validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: 'Invalid username or password'
      });
    }

    // check if the user's role matches the specified role
    if (user.role !== role.toLowerCase()) {
      return res.status(403).json({
        success: false,
        code: 403,
        message: 'User role does not match the specified role'
      });
    }

    // if the user is not verified, send verification data
    if (!user.isVerified) {
      const token = await generateNewVerificationToken(user.email); // generate a new verification token
      // send OTP
      await sendOTP(user.email);

      // encode email using base64
      const base64Email = Buffer.from(user.email).toString('base64');

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Please verify your account first.',
        action: 'verify',
        verificationUrl: `/verification?token=${token}&email=${base64Email}`
      });
    }

    let options = {
      maxAge: new Date(Date.now() + 15 * 60 * 1000), // would expire in 5 minutes
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: 'Strict'
    };

    // Retrieve the logged-in user excluding sensitive information
    const loggedInUser = await User.findById(user._id).select(
      '-password -refreshToken -otp -otpExpires -verificationToken -isTokenUsed -tokenExpires'
    );

    // generate access token and refresh token for user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        success: true,
        code: 200,
        action: 'redirect',
        redirectUrl: `/test/${user.role.toLowerCase()}`,
        message: 'You have successfully logged in.',
        user: loggedInUser,
        accessToken,
        refreshToken
      });
  } catch (err) {
    error('Error occurred while logging the user:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

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
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Email already exists'
      });
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
    return res.status(201).json({
      success: true,
      action: 'redirect',
      code: 201,
      message: 'Thank you for registering with us. Your account has been successfully created.',
      data: [],
      redirectUrl: `/verification?token=${token}&email=${base64Email}`
    });
  } catch (err) {
    error('Error registering user:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Get the session cookie or Authorization header
    const authHeader = req.headers['cookie'];

    // If neither are present, send an Unauthorized error
    if (!authHeader) return res.sendStatus(401);

    let accessToken, refreshToken;

    // extract the token from the correct cookie name
    if (req.headers['cookie']) {
      // Split the cookie string into key-value pairs
      const cookies = authHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});

      accessToken = cookies['accessToken'];
      refreshToken = cookies['refreshToken'];
    }

    // check if the access token is blacklisted
    const isAccessTokenBlacklisted = await isTokenBlacklisted(accessToken, 'access');
    const isRefreshTokenBlacklisted = await isTokenBlacklisted(refreshToken, 'refresh');

    // if either the access token or the refresh token is blacklisted, send a no content response
    if (isAccessTokenBlacklisted || isRefreshTokenBlacklisted) {
      return res.sendStatus(403); // tokens are blacklisted, proceed with no content response
    }

    if (accessToken) {
      // otherwise blacklist token
      await addToBlacklist(accessToken, 'access');
    }

    // blacklist refresh token (if present)
    if (refreshToken) {
      await addToBlacklist(refreshToken, 'refresh');
    }

    // assume the user's ID is stored in req.user after authentication
    const userId = req.user._id;

    // find the user by ID and delete the account
    const deletedUser = await User.findByIdAndDelete(userId);

    // check if the user was found and deleted
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'User not found'
      });
    }

    let options = {
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: 'Strict'
    };

    // clear request cookie on client
    return res
      .status(200)
      .setHeader('Clear-Site-Data', '"cookies"')
      .clearCookie('accessToken', options)
      .clearCookie('refreshToken', options)
      .json({
        success: true,
        code: 200,
        message: 'Account deleted sucessfully'
      });
  } catch (err) {
    error('Error occurred while deleting the account:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    // Get the session cookie or Authorization header
    const authHeader = req.headers['cookie'];

    // If neither are present, send an Unauthorized error
    if (!authHeader) return res.sendStatus(401);

    let accessToken, refreshToken;

    // If it's from the cookie, extract the token from the correct cookie name
    if (req.headers['cookie']) {
      // Split the cookie string into key-value pairs
      const cookies = authHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});

      accessToken = cookies['accessToken'];
      refreshToken = cookies['refreshToken'];
    }

    // check if the access token is blacklisted
    const isAccessTokenBlacklisted = await isTokenBlacklisted(accessToken, 'access');
    const isRefreshTokenBlacklisted = await isTokenBlacklisted(refreshToken, 'refresh');

    // if either the access token or the refresh token is blacklisted, send a no content response
    if (isAccessTokenBlacklisted || isRefreshTokenBlacklisted) {
      return res.sendStatus(403); // tokens are blacklisted, proceed with no content response
    }

    // otherwise blacklist token
    if (accessToken) {
      await addToBlacklist(accessToken, 'access');
    }

    // blacklist refresh token (if present)
    if (refreshToken) {
      await addToBlacklist(refreshToken, 'refresh');
    }

    // find the user and remove the refresh token
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { refreshToken: null }
      },
      { new: true }
    );

    let options = {
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: 'Strict'
    };

    // clear request cookie on client
    return res
      .status(200)
      .setHeader('Clear-Site-Data', '"cookies"')
      .clearCookie('accessToken', options)
      .clearCookie('refreshToken', options)
      .json({
        success: true,
        code: 200,
        message: 'Logged out successfully.'
      });
  } catch (err) {
    error('Error occurred while logging out the user:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  const { email: encodedEmail, otp } = req.body;

  try {
    // decode Base64 email
    const decodedEmail = Buffer.from(encodedEmail, 'base64').toString();

    // find the user by email
    const user = await User.findOne({ email: decodedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'User not found'
      });
    }

    // convert both OTPs to strings and trim any whitespace
    const storedOtp = user?.otp.toString().trim();
    const providedOtp = otp.toString().trim();

    // check if the OTP is valid
    if (storedOtp !== providedOtp) {
      return res.status(400).json({
        success: false,
        code: 400,
        data: [],
        message: 'Invalid OTP'
      });
    }

    // check if OTP has expired
    const currentTime = Date.now();
    if (user.otpExpires && user.otpExpires < currentTime) {
      return res.status(400).json({
        success: false,
        code: 400,
        data: [],
        message: 'OTP has expired'
      });
    }

    // if OTP is correct and not expired, mark email as verified
    user.isVerified = true;
    user.otp = null; // optionally clear OTP after successful verification
    user.otpExpires = null; // clear the expiration as well
    user.verificationToken = null;
    user.isTokenUsed = true;
    user.tokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Email verified sucessfully'
    });
  } catch (err) {
    error('Error during verification check:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.refreshToken = async (req, res, next) => {
  // retrieve the refresh token from cookies or request body
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  // if no refresh token is present, deny access with a 401 Unauthorized status
  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      code: 200,
      message: 'Refresh token not found'
    });
  }

  try {
    // check if the refresh token is blacklisted
    const isRefreshTokenBlacklisted = await isTokenBlacklisted(incomingRefreshToken, 'refresh');
    if (isRefreshTokenBlacklisted) {
      return res.status(403).json({
        success: false,
        code: 403,
        message: 'Refresh token is blacklisted'
      });
    }

    // verify the refresh token
    const decodedToken = jwt.verify(incomingRefreshToken, config.jwtRefreshSecret);

    // find the user associated with the refresh token
    const user = await User.findById(decodedToken?.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: 'Refresh token is incorrect' });
    }

    const incomingAccessToken = req.cookies.accessToken || req.body.accessToken;

    // check if the access token is blacklisted
    const isAccessTokenBlacklisted = await isTokenBlacklisted(incomingAccessToken, 'access');
    if (!isAccessTokenBlacklisted) {
      if (incomingAccessToken) {
        await addToBlacklist(incomingAccessToken, 'access');
      }
    }

    let options = {
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: 'Strict'
    };

    if (incomingRefreshToken) {
      // blacklist the old refresh token (optional)
      await addToBlacklist(incomingRefreshToken, 'refresh');
    }

    // generate access token and refresh token for user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(decodedToken?.id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        success: true,
        code: 201,
        message: 'Access token refreshed',
        accessToken,
        refreshToken
      });
  } catch (err) {
    error('Error occurred while creating token:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;

  // Validate input
  if (!token || !email || !newPassword) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: 'Token, email, and new password are required'
    });
  }

  try {
    // Decode the base64 email
    const decodedEmail = Buffer.from(email, 'base64').toString();

    // Find user by email and verify token
    const user = await User.findOne({
      email: decodedEmail,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Check if the token has not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid or expired token'
      });
    }

    // Update user's password
    user.password = newPassword; // Ensure password is hashed in your User model
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration
    await user.save();

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Password has been reset successfully'
    });
  } catch (err) {
    error('Error during reset password:', err);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email: encodedEmail } = req.body;

  // decode Base64 email
  const decodedEmail = Buffer.from(encodedEmail, 'base64').toString();

  // check if email is provided
  if (!decodedEmail) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: 'Email is required'
    });
  }

  try {
    // find user by email
    const user = await User.findOne({ email: decodedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'User not found'
      });
    }

    // generate a unique reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // set token and expiration in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send email with the reset link
    await sendForgotPasswordEmail(decodedEmail, resetToken);

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Reset password link has been sent to your email.'
    });
  } catch (err) {
    error('Error during forgot password:', err);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal Server Error'
    });
  }
};
