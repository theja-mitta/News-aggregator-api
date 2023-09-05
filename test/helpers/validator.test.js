const expect = require('chai').expect;
const validator = require('../../src/helpers/validator')
const userData = require('../../src/data/users.json');

let userDetails = {
        "email":"mike1@gmail.com",
        "password":"mike112345",
        "newsPreferences":{"countries":["us"],"sources":["Al Jazeera English"],"languages":["en"]}
    }

describe('Testing the user details function', function() {
    it('1. Validates the user details', function(done) {
        let response = validator.validateUserDetails(userDetails, userData);
        expect(response.status).equals(true);
        expect(response.message).equals('User details are valid');
        done();
    })

    it('2. User Registration - Email Duplication', function(done) {
        userData.users.push(userDetails);
        let response = validator.validateUserDetails(userDetails, userData);
        expect(response.status).equals(false);
        expect(response.message).equals('This email is already registered');
        done();
    })

    it('3. User Registration - Validating Complete User Object', function(done) {
        delete userDetails['email']
        let response = validator.validateUserDetails(userDetails, userData);
        expect(response.status).equals(false);
        expect(response.message).equals('Please pass valid user details');
        done();
    })

    it('4. User Registration - Invalid Email', function(done) {
        userDetails.email = "mike";
        let response = validator.validateUserDetails(userDetails, userData);
        expect(response.status).equals(false);
        expect(response.message).equals('Please provide a valid email address');
        done();
    })
    
    it('5. User Registration - Invalid News preferences', function(done) {
        userDetails.email = "john123@gmail.com";
        userDetails.newsPreferences.cities = ["newyork"];
        let response = validator.validateUserDetails(userDetails, userData);
        expect(response.status).equals(false);
        expect(response.message).equals('Please pass valid news preferences');
        done();
    })
})
