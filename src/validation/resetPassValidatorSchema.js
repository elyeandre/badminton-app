const Joi = require('joi');

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required.'
  }),
  email: Joi.string().base64().required().messages({
    'string.base64': 'Email must be a valid Base64 encoded string.',
    'any.required': 'Email is required.'
  }),
  newPassword: Joi.string()
    .min(8)
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .messages({
      'string.empty': 'Password is required.',
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    })
});

module.exports = { resetPasswordSchema };
