const { loginSchema } = require('../validation/loginValidatorSchema');

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

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
  validateLogin
};
