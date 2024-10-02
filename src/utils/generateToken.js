const CryptoJS = require('crypto-js');
const User = require('../models/User');

/**
 * Generates access and refresh tokens for a user and saves the refresh token in the database.
 * @param {String} userId - The ID of the user for whom to generate tokens.
 * @returns {Object} - Contains the generated access and refresh tokens.
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID in the database
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate an access token and a refresh token
    const { accessToken, refreshToken } = user.generateTokens();

    // Save the refresh token to the user in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Handle any errors that occur during the process
    throw new Error(error.message);
  }
};

/**
 * Generates a new verification token for the user.
 * @param {string} email - The user's email.
 * @returns {Promise<string>} - A promise that resolves with the new token after it's updated in the database.
 */
const generateNewVerificationToken = async (email) => {
  const randomBytes = CryptoJS.lib.WordArray.random(32); // Generate 32 random bytes
  const token = randomBytes.toString(); // Convert to a string

  await User.updateOne(
    { email },
    {
      verificationToken: token,
      tokenExpires: Date.now() + 3600000, // 1-hour expiry
      isTokenUsed: false // Ensure the token is marked as unused
    }
  );

  return token; // Return the generated token
};

// Export both functions for use in other parts of your application
module.exports = {
  generateAccessAndRefreshTokens,
  generateNewVerificationToken
};
