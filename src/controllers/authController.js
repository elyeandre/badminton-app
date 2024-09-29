const createError = require('http-errors');
const User = require('../models/User');
const { log, error } = console;
const { generateNewVerificationToken } = require('../utils/genVerificationToken');
const { generateAccessAndRefreshTokens } = require('../utils/generateToken');
const config = require('config');
const jwt = require('jsonwebtoken');
const { Buffer } = require('buffer');
const { sendOTP } = require('../services/emailService');
const Blacklist = require('../models/Blacklist');

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

exports.logoutUser = async (req, res, next) => {
  try {
    // Get the session cookie or Authorization header
    const authHeader = req.headers['cookie'] || req.header('Authorization')?.replace('Bearer ', '');

    // If neither are present, send an Unauthorized error
    if (!authHeader) return res.sendStatus(204);

    let token;

    // If it's from the cookie, extract the token from the correct cookie name
    if (req.headers['cookie']) {
      // Split the cookie string into key-value pairs
      const cookies = authHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});

      token = cookies['accessToken'];
    }

    const checkIfBlacklisted = await Blacklist.findOne({ token: token }); // check if that token is blacklisted

    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);

    // otherwise blacklist token
    const decoded = jwt.verify(token, config.jwtSecret);
    const expiresAt = new Date(decoded.exp * 1000); // convert exp to Date

    // add token to blacklist
    const blacklistEntry = new Blacklist({
      token,
      expiresAt
    });

    await blacklistEntry.save();

    // find the user and remove the refresh token
    log(req.user._id);
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
      data: [],
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

    let options = {
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: 'Strict'
    };

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
