const { verifySchema } = require('../validation/userVerifyValidatorSchema');

const validateVerify = (req, res, next) => {
  const { error } = verifySchema.validate(req.body, { abortEarly: false });

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
  validateVerify
};
