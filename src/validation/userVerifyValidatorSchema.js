const Joi = require('joi');

const verifySchema = Joi.object({
  email: Joi.string().base64().required().messages({
    'string.base64': 'Email must be a valid Base64 encoded string.',
    'any.required': 'Email is required.'
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be exactly 6 digits long.',
    'any.required': 'OTP is required.'
  })
});

module.exports = { verifySchema };
