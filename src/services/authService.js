const path = require('path');
const jwt = require('jsonwebtoken');
const { writeDataToPath } = require('../helpers/dataWriter');
const userData = require('../data/users.json');

const writePath = path.join(__dirname, '..', '/data/users.json');

/**
 * Generates an authentication token for a user.
 * @param {Object} userDetails - The user details object.
 * @returns {string} The generated authentication token.
 */
const generateAuthToken = (userDetails) => {
  // Generate a JWT token using the user's ID and JWT secret
  const token = jwt.sign({ id: userDetails.id.toString() }, process.env.JWT_SECRET);

  // Update the user's tokens array with the new token
  userData.users.forEach(user => {
    if (user.id === userDetails.id) {
      user.tokens = user.tokens.concat({ token });
    }
  });

  // Write the updated user data to the file system
  writeDataToPath(userData, writePath);

  return token;
};

module.exports = {
  generateAuthToken
};
