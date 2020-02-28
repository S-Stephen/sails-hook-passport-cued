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

  //   routes: {

  //     // These intercept our requests:
  //     before: {

  //       'post /logout': 'AuthController.logout',
  //       'get /login': 'AuthController.login',

  //       'post /auth/local': 'AuthController.callback',
  //       'post /auth/local/:action': 'AuthController.callback',

  //       'post /auth/:provider': 'AuthController.callback',
  //       'post /auth/:provider/:action': 'AuthController.callback',

  //       'get /auth/:provider': 'AuthController.provider',
  //       'get /auth/:provider/callback': 'AuthController.callback',
  //       'get /auth/:provider/:action': 'AuthController.callback',
  //     },
  //     after: {
  //       'GET /*': function (req, res, next) {
  //         //sails.log('got a url');
  //         //return next();
  //         return res.send('not found');
  //       }
  //     }
  //   }
  // };


  // Override http config here before hook initialisation
  // We migh not need mvcsloader - and it might be tied to the old version of sails
  var hookLoader = require('sails-util-mvcsloader')(sails);
  hookLoader.configure({
    policies: __dirname + '/api/policies', // Path to your hook's policies
    config: __dirname + '/config' // Path to your hook's config
  });
  //sails.config.paths.models = [sails.config.paths.models, __dirname + '/api/models'];
  //sails.log('test');
  //require('./api/policies')(sails, dir);
  //require('./config')(sails, dir);

  return {
    defaults: {
      passport: {}
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
