const Joi = require('joi');

// define the registration validation schema
const registrationSchema = Joi.object({
  first_name: Joi.string().trim().alphanum().min(2).max(30).required().messages({
    'string.empty': 'First name is required.',
    'string.min': 'First name must be at least 2 characters long.',
    'string.max': 'First name cannot be longer than 30 characters.',
    'string.alphanum': 'First name must only contain alphanumeric characters.'
  }),
  middle_name: Joi.string().trim().allow(''), // optional middle name
  last_name: Joi.string().trim().min(2).max(30).required().messages({
    'string.empty': 'Last name is required.',
    'string.min': 'Last name must be at least 2 characters long.',
    'string.max': 'Last name cannot be longer than 30 characters.'
  }),
  email: Joi.string()
    .email()
    .lowercase() // Ensure email is lowercase
    .required()
    .custom((value, helpers) => {
      const validDomains = ['gmail.com', 'yahoo.com', 'googlemail.com'];
      const domain = value.split('@')[1];
      if (!validDomains.includes(domain)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Email is required.',
      'string.email': 'Please enter a valid email address.',
      'any.invalid': 'Email must be from Gmail, Yahoo, or Googlemail.'
    }),
  username: Joi.string().trim().min(4).required().messages({
    'string.empty': 'Username is required.',
    'string.min': 'Username must be at least 4 characters long.'
  }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .messages({
      'string.empty': 'Password is required.',
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref('password')) // Ensure confirm_password matches password
    .required()
    .messages({
      'any.only': 'Confirm password must match password.',
      'string.empty': 'Confirm password is required.'
    }),
  gender: Joi.string().valid('male', 'female').required().lowercase().messages({
    'string.empty': 'Gender is required.',
    'any.only': 'Gender must be either Male or Female.'
  }),
  date_of_birth: Joi.date().required().messages({
    'date.base': 'Valid date of birth is required.'
  }),
  municipality: Joi.string().trim().required().messages({
    'string.empty': 'Municipality is required.'
  }),
  contact_number: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Contact number is required.',
      'string.pattern.base': 'Please enter a valid contact number.'
    }),
  role: Joi.string().valid('admin', 'player', 'coach').required().lowercase().messages({
    'string.empty': 'Role is required.',
    'any.only': 'Role must be either Admin, Player, or Coach.'
  }),
  status_owner: Joi.string()
    .valid('single', 'married', 'widowed/er', 'separated', 'cohabitant')
    .lowercase()
    .when('role', {
      is: 'admin', // Lowercase 'admin' for comparison
      then: Joi.required(),
      otherwise: Joi.forbidden() // disallow for non-Admin roles
    })
    .messages({
      'string.empty': 'Status is required for Admins.',
      'any.only': 'Status must be one of the valid options: Single, Married, Widowed/er, Separated, or Cohabitant.'
    })
});

module.exports = {
  registrationSchema
};
