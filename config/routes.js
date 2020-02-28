/**
 * Created by jaumard on 12/05/2015.
 */
module.exports.routes = {

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
};
