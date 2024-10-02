const jwt = require('jsonwebtoken');
const Blacklist = require('../models/Blacklist');
const config = require('config');

/**
 * Adds a token to the blacklist with an expiration date.
 *
 * @param {string} token - The token to be blacklisted.
 * @param {string} type - The type of the token ('access' or 'refresh').
 * @returns {Promise<void>}
 */
async function addToBlacklist(token, type) {
  // Determine the appropriate secret based on the token type
  const secret = type === 'access' ? config.jwtSecret : config.jwtRefreshSecret;

  const decoded = jwt.decode(token, secret); // Decode the token using the appropriate secret

  let expiresAt;
  if (decoded && decoded.exp) {
    expiresAt = new Date(decoded.exp * 1000); // JWT exp is in seconds
  } else {
    throw new Error('Invalid token or token does not have an expiration date.');
  }

  await Blacklist.create({ token, type, expiresAt });
}

/**
 * Checks if a token is blacklisted and removes it if expired.
 *
 * @param {string} token - The token to check.
 * @param {string} type - The type of the token ('access' or 'refresh').
 * @returns {Promise<boolean>} - Returns true if the token is blacklisted; false if not.
 */
async function isTokenBlacklisted(token, type) {
  const blacklistedToken = await Blacklist.findOne({ token, type });

  // If token is blacklisted but expired, remove it and return false
  if (blacklistedToken && new Date() > blacklistedToken.expiresAt) {
    await Blacklist.deleteOne({ token });
    return false;
  }

  return !!blacklistedToken;
}

module.exports = {
  addToBlacklist,
  isTokenBlacklisted
};
