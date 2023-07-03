const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/userService');

const authService = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = findUserById(decoded.id);
        
        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch(e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}

module.exports = authService;