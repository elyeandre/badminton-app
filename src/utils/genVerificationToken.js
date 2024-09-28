const CryptoJS = require('crypto-js');
const User = require('../models/User'); // Adjust the path as necessary

/**
 * Generates a new verification token for the user.
 * @param {string} email - The user's email.
 * @returns {Promise<string>} - A promise that resolves with the new token after it's updated in the database.
 */
async function generateNewVerificationToken(email) {
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
}

// Export the function for use in other parts of your application
module.exports = {
  generateNewVerificationToken
};
