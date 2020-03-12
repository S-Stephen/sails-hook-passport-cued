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
  loginView: '../node_modules/sails-hook-passport-cued/templates/auth/login',
  loginLocal: '../node_modules/sails-hook-passport-cued/templates/auth/local', // where our login page lives
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
      status: 'inactive',
      name: 'Local',
      provider: 'local', // required
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
      status: 'inactive',
      name: 'Google',
      protocol: 'oauth2',
      strategy: require('passport-google-oauth').OAuth2Strategy,
      options: {
        clientID: '<Your client ID>',
        clientSecret: '<Your client secret>',
        scope: 'email',
        hostedDomain: 'cam.ac.uk'
      }
    },
    raven: {
      status: 'inactive',
      name: 'UcamWebauth',
      protocol: 'WAAWLS', // NB protocol must be alpha numeric (not WAA->WLS) to store in passport
      strategy: require('passport-raven').Strategy,
      options: {
        audience: 'http://<your host>:<your port>',
        desc: ',Your application name here>',
        msg: 'we need to check you are a current student'
        // use demonstration raven server in development
        //debug: process.env.NODE_ENV !== 'production',
        //debug: false
      },

      func: function (crsid, response, cb) {
        console.dir(response);
        cb(null, {
          crsid: crsid,
          isCurrent: response.isCurrent
        });
      }
    }
  }
};
