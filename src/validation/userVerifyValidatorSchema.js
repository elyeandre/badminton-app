const Joi = require('joi');

const verifySchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required.'
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be exactly 6 digits long.',
    'any.required': 'OTP is required.'
  })
});

module.exports = { verifySchema };
