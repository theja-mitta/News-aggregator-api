class Validator {
    static validateUserDetails(userDetails, userData) {
      if (
        userDetails.hasOwnProperty("email") &&
        userDetails.hasOwnProperty("password") &&
        userDetails.hasOwnProperty("newsPreferences") &&
        this.validateValuesInUserDetails(userDetails) &&
        this.validateEmailId(userDetails.email) &&
        this.validateNewsPreferences(userDetails.newsPreferences) &&
        this.validateUniqueUserEmailId(userDetails.email, userData)
      ) {
        return {
          status: true,
          message: "User details are valid",
        };
      }

      if (userDetails && !this.validateValuesInUserDetails(userDetails)) {
        return {
          status: false,
          message: "Please pass valid user details",
        };
      }
  
      if (userDetails && !this.validateEmailId(userDetails.email)) {
        return {
          status: false,
          message: "Please provide a valid email address",
        };
      }

      if (userDetails && !this.validateNewsPreferences(userDetails.newsPreferences)) {
        return {
          status: false,
          message: "Please pass valid news preferences",
        };
      }

      if (userDetails && !this.validateUniqueUserEmailId(userDetails.email, userData)) {
        return {
          status: false,
          message: "This email is already registered",
        };
      }
  
      return {
        status: false,
        message: "User details provided are malformed, please provide all required fields",
      };
    }

    static validateValuesInUserDetails(userDetails) {
      if (userDetails.hasOwnProperty("email") && userDetails.hasOwnProperty("password") && userDetails.hasOwnProperty("newsPreferences")) {
        return userDetails.email !== "" && userDetails.password !== "" && userDetails.newsPreferences !== "";
      }
    }
  
    static validateNewsPreferences(newsPreferences) {
      const allowedPreferences = ["countries", "sources", "languages"];
      const passedPreferences = Object.keys(newsPreferences);
      const arePreferencesValid = passedPreferences.every((preference) =>
        allowedPreferences.includes(preference)
      );
      return arePreferencesValid;
    }
  
    static validateEmailId(email) {
      return /^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/.test(email);
    }
  
    static validateUniqueUserEmailId(email, userData) {
      const valueFound = userData.users.some((user) => user.email === email);
      return !valueFound;
    }
  }
  
  module.exports = Validator;
  