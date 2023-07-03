const express = require('express');
const bodyParser = require('body-parser');
const uuid = require("uuid");
const validator = require('../helpers/validator');
const { saveUser, findUserByCredentials, logoutUser, getUserNewsPreferences, updateUserNewsPreferences } = require('../services/userService');
const { generateAuthToken } = require('../services/authService');
const auth = require('../middleware/auth');

const userRoutes = express.Router();
const userData = require('../data/users.json');

userRoutes.use(bodyParser.urlencoded({ extended: false }));
userRoutes.use(bodyParser.json());


userRoutes.post('/register', (req, res) => {
    // Generate a unique ID for the new user (e.g., using a UUID library) and add it to request body
    const userDetails = {id: uuid.v4(), ...req.body, createdAt: new Date(), tokens: []};

    // Perform validation and handle registration logic
    const userValidationResult = validator.validateUserDetails(userDetails, userData);
    if (userValidationResult.status) {
        try {
            const user = saveUser(userDetails);
            const token = generateAuthToken(user);
            res.status(201).send({ message: 'User registered successfully', token });
        } catch(e) {
            res.status(400).send(e);
        }
    } else {
        res.status(400).json(userValidationResult);
    }
});

userRoutes.post('/login', async (req, res) => {
    try {
        const user = await findUserByCredentials(req.body.email, req.body.password);
        const token = generateAuthToken(user);
        res.status(200).send({ user, token });
    } catch(e) {
        res.status(400).send(e);
    }
});


userRoutes.post('/logout', auth, async (req, res) => {
    try {
        logoutUser(req.user);
        res.send();
    } catch(e) {
        res.status(500).send(e);
    }
});

userRoutes.get('/preferences', auth, async (req, res) => {
    try {
        const preferences = getUserNewsPreferences(req.user.id, req.token);
        res.status(200).send(preferences);
    } catch(e) {
        res.status(500).send(e);
    }
});

userRoutes.put('/preferences', auth, async (req, res) => {
    const preferencesValidationResult = validator.validateNewsPreferences(req.body);
    if (preferencesValidationResult) {
        try {
            const preferences = updateUserNewsPreferences(req.token, req.body);
            res.status(200).send(preferences);
        } catch(e) {
            res.status(500).send(e);
        }
    } else {
        res.status(400).json({message:"Please pass valid news preferences"});
    }
});

module.exports = userRoutes;