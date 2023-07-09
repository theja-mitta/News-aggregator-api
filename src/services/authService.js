const path = require('path');
const jwt = require('jsonwebtoken');
const { writeDataToPath } = require('../helpers/dataWriter');
const { getUserData } = require('../services/userService');

const writePath = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, '..', '/../test/data/users.test.json')
  : path.join(__dirname, '..', '/data/users.json');

/**
 * Generates an authentication token for a user.
 * @param {Object} userDetails - The user details object.
 * @returns {string} The generated authentication token.
 */
const generateAuthToken = async (userDetails) => {
  try {
    // Generate a JWT token using the user's ID and JWT secret
    const token = await jwt.sign({ id: userDetails.id.toString() }, process.env.JWT_SECRET);

    // Write the updated user data to the file system
    const userData = getUserData();
    writeDataToPath(userData, writePath);
    
    return token;
  } catch (err) {
    throw new Error(err);
  }

};

module.exports = {
  generateAuthToken
};
