const path = require('path');
const bcrypt = require('bcryptjs');
const { writeDataToPath } = require('../helpers/dataWriter');
// userDataSource.js
const userData = process.env.NODE_ENV === 'test'
  ? require('../../test/data/users.test.json')
  : require('../data/users.json');

const writePath = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, '..', '/../test/data/users.test.json')
  : path.join(__dirname, '..', '/data/users.json');

// Save a new user to the data store
const saveUser = async (user) => {
  // Add the new user to the array
  user.password = await bcrypt.hash(user.password, 8);
  userData.users.push(user);
  writeDataToPath(userData, writePath);
  return user;
};

// Find a user by their login credentials
const findUserByCredentials = async (email, password) => {
  const user = userData.users.find((user) => user.email === email);
  if (!user) {
    throw new Error('User not found');
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid password provided');
  }

  return user;
};

// Find a user by their ID
const findUserById = (id) => {
  const user = userData.users.find((user) => user.id === id);

  if (!user) {
    throw new Error('Unable to find the user with id ' + id);
  }

  return user;
};

// Logout a user by clearing their tokens
const logoutUser = (user) => {
  userData.users.forEach((userDetails) => {
    if (userDetails.id == user.id) {
      userDetails.tokens = [];
    }
  });

  writeDataToPath(userData, writePath);
};

// Get the news preferences of a user
const getUserNewsPreferences = (id, token) => {
  // TODO: Fix valueFound
  const user = userData.users.find((user) => {
    console.log("USER: " + Object.keys(user));
    if (user.id === id) {
      const valueFound = user.tokens.find((userToken) => userToken.token === token);
      if (valueFound) {
        return true;
      }
    }
    return false;
  });

  if (!user) {
    throw new Error('Unable to find the user with id ' + id);
  }

  return user.newsPreferences;
};

// Update the news preferences of a user
const updateUserNewsPreferences = (token, data) => {
  const userIndex = userData.users.findIndex((user) => user.tokens.find((userToken) => userToken.token === token));
  if (userIndex === -1) {
    throw new Error('Unable to update preferences');
  }

  userData.users[userIndex].newsPreferences = data;
  writeDataToPath(userData, writePath);
};

// Get the user data
const getUserData = () => {
  return userData;
};

module.exports = {
  saveUser,
  findUserByCredentials,
  findUserById,
  logoutUser,
  getUserNewsPreferences,
  updateUserNewsPreferences,
  getUserData,
};
