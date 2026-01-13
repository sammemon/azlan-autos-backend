const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg);
    return errorResponse(res, 400, 'Validation failed', extractedErrors);
  }
  
  next();
};

module.exports = validateRequest;
