const { registrationSchema } = require('../validation/userRegValidatorSchema');

const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => ({
        message: err.message,
        path: err.path[0]
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration
};
