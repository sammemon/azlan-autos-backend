const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const expiresIn = process.env.JWT_EXPIRE && process.env.JWT_EXPIRE.trim() !== ''
    ? process.env.JWT_EXPIRE
    : '7d'; // Fallback to 7 days if env not set

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = generateToken;
