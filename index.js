'use strict';

var auth = require('./api/controllers/AuthController');

// lodash or @sailshq loadash are exposed globally
// a special ldash exists for sails < 0.12!
var _ = require('lodash');

module.exports = function sailsHookPassportCued(sails) {

  //return {

  //   defaults: require('./defaults'),
  //   configure: require('./configure')(sails),
  //   initialize: require('./initialize')(sails),


  // Override http config here before hook initialisation
  // We migh not need mvcsloader - and it might be tied to the old version of sails
  var hookLoader = require('sails-util-mvcsloader')(sails);
  hookLoader.configure({
    policies: __dirname + '/api/policies', // Path to your hook's policies
  //  config: __dirname + '/config' // Path to your hook's config
  });
  //sails.config.paths.models = [sails.config.paths.models, __dirname + '/api/models'];
  //sails.log('test');
  //require('./api/policies')(sails, dir);
  //require('./config')(sails, dir);

  return {
    defaults: {
      passport: {},
      policies: {
        'AuthController': {
          'test': ['sessionAuth'],
          '*': ['passport']
        },
        '*': ['passport', 'sessionAuth'] // insists all requests generate a passport session
      },
      http: {
        middleware: {
          passportCuedInit: require('passport').initialize(), // add after session
          passportCuedSession: require('passport').session(), // add after passportCuedInit
        }
      },
      passport: {
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
      }
    },

    routes: {
      // These intercept our requests:
      before: {
        'post /logout': 'AuthController.logout',
        'get /login': 'AuthController.login',
      
        'post /auth/local': 'AuthController.callback',
        'post /auth/local/:action': 'AuthController.callback',
      
        'post /auth/:provider': 'AuthController.callback',
        'post /auth/:provider/:action': 'AuthController.callback',
      
        'get /auth/:provider': 'AuthController.provider',
        'get /auth/:provider/callback': 'AuthController.callback',
        'get /auth/:provider/:action': 'AuthController.callback',
      
        'get /test': 'AuthController.test'
      }
    },

    initialize: function (cb) {

      // register the functions form our controller as actions:
      // replaces the inject below
      // TODO: convert the AuthController into actions
      Object.keys(auth).forEach(key =>
        sails.registerAction(auth[key], 'auth/' + key)
      );

      //we are unable to load controllers here as sails.hooks.controllers doesn't appear to exist?!
      hookLoader.inject({
          // controllers: __dirname + '/api/controllers', // Path to your hook's controllers
          models: __dirname + '/api/models', // Path to your hook's models
          services: __dirname + '/api/services' // Path to your hook's services
        },
        err => {
          if (!err) {
            sails.services.passport.loadStrategies();
          }
          return cb(err);
        }
      );
    }
  };
};
