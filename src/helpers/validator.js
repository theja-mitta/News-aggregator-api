class validator {
    static validateUserDetails(userDetails, userData) {
        if (userDetails.hasOwnProperty("email") &&
        userDetails.hasOwnProperty("password") &&
        userDetails.hasOwnProperty("newsPreferences") &&
        this.validateEmailId(userDetails) &&
        this.validateValuesInUserDetails(userDetails) && 
        this.validateNewsPreferences(userDetails["newsPreferences"]) &&
        this.validateUniqueUserEmailId(userDetails, userData)) {
            return {
                "status": true,
                "message": "User has been registered"
            };
        }
        if (!this.validateEmailId(userDetails, userData)) {
            return {
                "status": false,
                "message": "Email is not valid"
            };
        }
        if (!this.validateUniqueUserEmailId(userDetails, userData)) {
            return {
                "status": false,
                "message": "User email id should be unique"
            };
        }
        if (!this.validateValuesInUserDetails(userDetails)) {
            return {
                "status": false,
                "message": "Please pass valid user details"
            };
        }
        if (!this.validateNewsPreferences(userDetails["newsPreferences"])) {
            return {
                "status": false,
                "message": "Please pass valid news preferences"
            };
        }
        return {
            "status": false,
            "message": "User details provided are malformed, please provide all require fields"
        };
    }

    static validateNewsPreferences(userDetails) {
        const newsPreferencesPassed = Object.keys(userDetails);
        const allowedNewsPreferences = ["countries", "sources", "languages"];
        const arePreferencesValid = newsPreferencesPassed.every(preference => allowedNewsPreferences.includes(preference));
        return arePreferencesValid;
    }

    static validateEmailId(userDetails) {
        if (!(/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/).test(String(userDetails.email))) {
            return false;
        }
        return true;
    }

    static validateValuesInUserDetails(userDetails) {
        if (userDetails.email != '' && 
        userDetails.password != '' && 
        userDetails.newsPreferences != '') {
            return true;
        }
        return false;
    }

    static validateUniqueUserEmailId(userDetails, userData) {
        let valueFound = userData.users.some(user => {
            console.log(user.email, userDetails.email);
            user.email == userDetails.email
        });
        if (valueFound) return false;
        return true;
    }
}

module.exports = validator;