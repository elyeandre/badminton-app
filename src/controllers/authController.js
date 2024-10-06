const User = require('../models/User');
const { log, error } = console;
const { generateAccessToken, generateRefreshToken, generateNonce } = require('../utils/generateToken');
const { addToBlacklist, isTokenBlacklisted } = require('../utils/blackListUtils');
const config = require('config');
const jwt = require('jsonwebtoken');
const { Buffer } = require('buffer');
const { sendOTP, sendForgotPasswordEmail } = require('../services/emailService');

exports.loginUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

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
      // generate a unique nonce
      const nonce = await generateNonce(user.email, 'verification');

      // create a JWT token for verification with email and nonce
      const generateEmailVerificationToken = (email, nonce) => {
        return jwt.sign({ email, nonce }, config.get('jwtSecret'), {
          expiresIn: '20m' // Token valid for 20 minutes or adjust as needed
        });
      };

      const token = generateEmailVerificationToken(user.email, nonce);

      await sendOTP(user.email);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Please verify your account first.',
        action: 'verify',
        verificationUrl: `/verification?token=${token}`
      });
    }

    let options = {
      maxAge: new Date(Date.now() + 15 * 60 * 1000), // would expire in 5 minutes
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: 'Strict'
    };

    // generate access token and refresh token for user
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    // Determine redirect URL based on user role
    let redirectUrl;
    if (user.role === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (user.role === 'player' || user.role === 'coach') {
      redirectUrl = '/user/dashboard';
    }

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        success: true,
        action: 'redirect',
        code: 200,
        message: 'You have successfully logged in.',
        redirectUrl
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

    // generate a unique nonce
    const nonce = await generateNonce(email, 'verification');
    // const generateNonce = () => crypto.randomBytes(16).toString('hex');

    // create a JWT token for verification with email and nonce
    const generateEmailVerificationToken = (email, nonce) => {
      return jwt.sign({ email, nonce }, config.get('jwtSecret'), {
        expiresIn: '20m' // Token valid for 20 minutes or adjust as needed
      });
    };

    const token = generateEmailVerificationToken(email, nonce);

    await sendOTP(email);

    // verification page with  token
    return res.status(201).json({
      success: true,
      action: 'redirect',
      code: 201,
      message: 'Thank you for registering with us. Your account has been successfully created.',
      redirectUrl: `/verification?token=${token}`
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
  const { token, otp } = req.body;

  try {
    // Check if the token is blacklisted
    const isVerificationTokenBlacklisted = await isTokenBlacklisted(token, 'verify');
    if (isVerificationTokenBlacklisted) {
      return res.status(403).json({
        success: false,
        code: 403,
        message: 'Invalid Token'
      });
    }
    // Verify the token synchronously
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // Find the user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'User not found'
      });
    }

    // Convert both OTPs to strings and trim any whitespace
    const storedOtp = user.otp?.toString().trim();
    const providedOtp = otp?.toString().trim();

    // Check if the OTP is valid
    if (storedOtp !== providedOtp) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP has expired
    const currentTime = Date.now();
    if (user.otpExpires && user.otpExpires < currentTime) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'OTP has expired'
      });
    }

    // Check if the nonce in the token matches the stored nonce
    if (decoded.nonce !== user.verificationNonce) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid or expired token'
      });
    }

    // Mark email as verified
    user.isVerified = true;
    user.otp = null; // Clear OTP after successful verification
    user.otpExpires = null; // Clear the expiration as well
    user.verificationNonce = null;

    await user.save();

    // Add the token to the blacklist
    await addToBlacklist(token, 'verify');

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.error('Error during verification check:', err);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.refreshToken = async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  // If no refresh token is present, deny access
  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      code: 200,
      message: 'Refresh token not found'
    });
  }

  try {
    // Check if the refresh token is blacklisted
    const isRefreshTokenBlacklisted = await isTokenBlacklisted(incomingRefreshToken, 'refresh');
    if (isRefreshTokenBlacklisted) {
      return res.status(403).json({
        success: false,
        code: 403,
        message: 'Refresh token is blacklisted'
      });
    }

    const decoded = jwt.verify(incomingRefreshToken, config.get('jwtRefreshSecret'));

    // Find the user associated with the refresh token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If refresh token in DB does not match the incoming refresh token
    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: 'Refresh token is incorrect' });
    }

    const incomingAccessToken = req.cookies.accessToken || req.body.accessToken;

    // Check if the access token is blacklisted
    const isAccessTokenBlacklisted = await isTokenBlacklisted(incomingAccessToken, 'access');
    if (!isAccessTokenBlacklisted && incomingAccessToken) {
      await addToBlacklist(incomingAccessToken, 'access');
    }

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    };

    // Generate new access token
    const accessToken = await generateAccessToken(decoded.id);

    return res.status(200).cookie('accessToken', accessToken, options).json({
      success: true,
      code: 201,
      message: 'Access token refreshed'
    });
  } catch (err) {
    console.error('Error occurred while refreshing token:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirm_password } = req.body;

  try {
    // Check if the refresh token is blacklisted
    const isResetPasswordTokenBlacklisted = await isTokenBlacklisted(token, 'reset');
    if (isResetPasswordTokenBlacklisted) {
      return res.status(403).json({
        success: false,
        code: 403,
        message: 'Reset Password token is blacklisted'
      });
    }

    // verify the JWT token
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    // find the user by ID from the decoded token
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'User not found'
      });
    }

    // check if the nonce in the token matches the stored nonce
    if (decoded.nonce !== user.resetPasswordNonce) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid or expired token'
      });
    }

    // check if the reset password nonce has expired
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Reset password link has expired'
      });
    }

    // check if the new password is the same as the old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'New password cannot be the same as the old password'
      });
    }

    // update user's password
    user.confirm_password = confirm_password;
    user.password = newPassword;
    user.resetPasswordNonce = null; // Clear the nonce
    user.resetPasswordExpires = null; // Clear the expiration
    await user.save();

    await addToBlacklist(token, 'reset');

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Password has been reset successfully'
    });
  } catch (err) {
    console.error('Error during reset password:', err);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email: encodedEmail } = req.body;
  const decodedEmail = Buffer.from(encodedEmail, 'base64').toString();

  if (!decodedEmail) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: 'Email is required'
    });
  }

  try {
    const user = await User.findOne({ email: decodedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'User not found'
      });
    }

    // generate a unique nonce
    const nonce = await generateNonce(user.email, 'passwordReset');

    // create a JWT containing the nonce and user ID
    const resetToken = jwt.sign(
      { id: user._id, nonce: nonce },
      config.get('jwtSecret'),
      { expiresIn: '10m' } // Token expires in 10 min
    );

    await user.save();

    // Send email with the reset link containing the JWT
    await sendForgotPasswordEmail(decodedEmail, resetToken);

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Reset password link has been sent to your email.',
      resetToken
    });
  } catch (err) {
    console.error('Error during forgot password:', err);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal Server Error'
    });
  }
};
