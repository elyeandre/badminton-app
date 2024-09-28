const Joi = require('joi');

// Define the login validation schema
const loginSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    'string.min': 'Username must be at least 3 characters long.',
    'string.empty': 'Username is required.'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.empty': 'Password is required.'
  }),
  role: Joi.string().valid('admin', 'coach', 'player').required().lowercase().messages({
    'any.only': 'Role must be either Admin, Coach, or Player.',
    'string.empty': 'Role is required.'
  })
});

module.exports = { loginSchema };
