const userData = require('../data/users.json');
const path = require('path');
const jwt = require('jsonwebtoken');
const { writeDataToPath } = require('../helpers/dataWriter');

const writePath = path.join(__dirname, '..', '/data/users.json');

const generateAuthToken = (userDetails) => {
    const token = jwt.sign({ id: userDetails.id.toString() }, process.env.JWT_SECRET)

    userData.users.forEach(user => {
        if (user.id === userDetails.id) {
            user.tokens = user.tokens.concat({ token })
        }
      });
    
    writeDataToPath(userData, writePath);
    return token;
}

module.exports = {
    generateAuthToken
};