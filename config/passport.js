/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 *
 * Copy and override this file into <your app>/config/passport.js
 *
 */

module.exports.passport = {
  // a new user has been created - where do we direct them (we may not want auto enrol)
  userVerifyRedirect: '/member/confirmacc',
  // If this email domain exists remove from the username
  removeEmailDomain: '<remove @.domain address>',
  // Our index page
  siteIndex: '/index',
  hostname: 'http://localhost:1337',
  login_view: '../node_modules/sails-hook-passport-cued/templates/auth/login',
  redirect: {
    login: '/', //Login successful
    logout: '/' //Logout successful
  },
  onUserCreated: function (user, providerInfos) {
    //Send email for example
  },
  onUserLogged: function (session, user) {
    //Set user infos in session for example
  },
  strategies: {

    local: {
      strategy: require('passport-local').Strategy
    },
    /*
        twitter : {
          name     : 'Twitter',
          protocol : 'oauth',
          strategy : require('passport-twitter').Strategy,
          options  : {
            consumerKey    : 'your-consumer-key',
            consumerSecret : 'your-consumer-secret'
          }
        },

        facebook : {
          name     : 'Facebook',
          protocol : 'oauth2',
          strategy : require('passport-facebook').Strategy,
          options  : {
            clientID     : 'your-client-id',
            clientSecret : 'your-client-secret',
            scope        : ['email'] // email is necessary for login behavior
  }
},
*/
    google: {
      name: 'Google',
      protocol: 'oauth2',
      strategy: require('passport-google-oauth').OAuth2Strategy,
      options: {
        clientID: '<Your client ID>',
        clientSecret: '<Your client secret>',
        scope: 'email',
        hostedDomain: 'cam.ac.uk'
      }
    }
  }
};
