const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/userService');

// Middleware function for authentication and authorization
const authService = async (req, res, next) => {
  try {
    // Extract the token from the request header
    const token = req.header('Authorization').replace('Bearer ', '');

    // Verify the token and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by their ID
    const user = findUserById(decoded.id);

    // Check if the user exists
    if (!user) {
      throw new Error();
    }

    // Attach the token and user to the request object for further processing
    req.token = token;
    req.user = user;

    // Call the next middleware in the chain
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = authService;
