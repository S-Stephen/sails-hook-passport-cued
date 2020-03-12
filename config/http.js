/**
 * Provides custom middleware that needs to be added to the 
 * exports.http.middleware object (ie order)
 */
module.exports.http = {
  middleware: {
    
    passportCuedInit: require('passport').initialize(), // add after session
    passportCuedSession: require('passport').session(), // add after passportCuedInit

  }
};
