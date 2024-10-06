const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each user to 15 requests per windowMs
  standardHeaders: true, // Add the `RateLimit-*` headers to the response
  legacyHeaders: false, // Remove the `X-RateLimit-*` headers from the response
  message: {
    success: false,
    code: 429,
    message: 'Too many requests, please try again later.'
  },
  keyGenerator: (req, res) => {
    // Check if user is authenticated and has an ID
    if (req.user && req.user.id) {
      return req.user.id; // Use user ID as the key for rate limiting
    } else {
      return req.ip; // Fall back to using the IP address if user is not authenticated
    }
  }
});

module.exports = {
  limiter
};
