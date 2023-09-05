const express = require('express');
const bodyParser = require('body-parser');
const uuid = require("uuid");
const validator = require('../helpers/validator');
const {
    saveUser,
    findUserByCredentials,
    logoutUser,
    getUserNewsPreferences,
    updateUserNewsPreferences,
    getUserData
  } = require('../services/userService');
const { generateAuthToken } = require('../services/authService');
const auth = require('../middleware/auth');

const userRoutes = express.Router();

userRoutes.use(bodyParser.urlencoded({ extended: false }));
userRoutes.use(bodyParser.json());


// Register a new user
// POST /users/register
userRoutes.post('/register', async (req, res) => {
    // Generate a unique ID for the new user (e.g., using a UUID library) and add it to request body
    const userDetails = { id: uuid.v4(), ...req.body, createdAt: new Date()};

    // Perform validation and handle registration logic
    const userData = getUserData();
    const userValidationResult = validator.validateUserDetails(userDetails, userData);
    if (userValidationResult.status) {
        try {
            const user = await saveUser(userDetails);
            const token = await generateAuthToken(user);
            res.status(201).send({ message: 'User registered successfully', token });
        } catch (e) {
            res.status(400).send({message: e.message});
        }
    } else {
        res.status(400).json(userValidationResult);
    }
});

// User login
// POST /users/login
userRoutes.post('/login', async (req, res) => {
    try {
        const user = await findUserByCredentials(req.body.email, req.body.password);
        const token = await generateAuthToken(user);
        res.status(200).send({ message: "User logged in successfully", user, token });
    } catch (e) {
        if (e.message === 'Invalid password provided') {
            res.status(401).send({message: e.message, token: null});
        } else if (e.message === 'User not found') {
            res.status(404).send({message: e.message, token: null});
        } else {
            res.status(500).send({message: e.message});
        }
    }
});


// User logout
// POST /users/logout
userRoutes.post('/logout', auth, async (req, res) => {
    try {
        logoutUser(req.user);
        res.send();
    } catch (e) {
        res.status(500).send({message: e.message});
    }
});

// Get user's news preferences
// GET /users/preferences
userRoutes.get('/preferences', auth, async (req, res) => {
    try {
        const preferences = getUserNewsPreferences(req.user.id, req.token);
        res.status(200).send(preferences);
    } catch (e) {
        res.status(500).send({message: e.message});
    }
});

// Update user's news preferences
// PUT /users/preferences
userRoutes.put('/preferences', auth, async (req, res) => {
    const preferencesValidationResult = validator.validateNewsPreferences(req.body);
    if (preferencesValidationResult) {
        try {
            const preferences = updateUserNewsPreferences(req.token, req.body);
            res.status(200).send(preferences);
        } catch (e) {
            res.status(500).send({message: e.message});
        }
    } else {
        res.status(400).json({ message: 'Please pass valid news preferences' });
    }
});

module.exports = userRoutes;