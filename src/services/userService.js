const path = require('path');
const bcrypt = require('bcryptjs');
const { writeDataToPath } = require('../helpers/dataWriter');
const userData = require('../data/users.json');

const writePath = path.join(__dirname, '..', '/data/users.json');

const saveUser = async (user) => {
  // Add the new user to the array
  user.password = await bcrypt.hash(user.password, 8);
  userData.users.push(user);
  writeDataToPath(userData, writePath);
  return user;
};

const findUserByCredentials = async (email, password) => {
  const user = userData.users.find(user => user.email === email);
  if (!user) {
      throw new Error('Unable to login');
  }

  // compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
}

const findUserById = (id) => {
  const user = userData.users.find(user => user.id === id);

  if (!user) {
    throw new Error('Unable to find the user with id' + id);
  }

  return user;
}

const logoutUser = (user) => {
  userData.users.forEach(userDetails => {
    if (userDetails.id == user.id) {
      userDetails.tokens = [];
    }
  });

  writeDataToPath(userData, writePath);
}

const getUserNewsPreferences = (id, token) => {
  const user = userData.users.find(user => {
    if (user.id === id) {
      const valueFound = user.tokens.find(userToken => userToken.token === token);
      if (valueFound) {
        return true;
      }
    }
    return false;
  });

  if (!user) {
    throw new Error('Unable to find the user with id' + id);
  }

  return user.newsPreferences;
}

const updateUserNewsPreferences = (token, data) => {

  const userIndex = userData.users.findIndex((user) => user.tokens.find((userToken) => userToken.token === token));
  if (userIndex === -1) {
    throw new Error('Unable to update preferences');
  }

  userData.users[userIndex].newsPreferences = data;
  writeDataToPath(userData, writePath);
}

const getUserData = () => {
  return userData;
}


module.exports = {
  saveUser,
  findUserByCredentials,
  findUserById,
  logoutUser,
  getUserNewsPreferences,
  updateUserNewsPreferences,
  getUserData
};