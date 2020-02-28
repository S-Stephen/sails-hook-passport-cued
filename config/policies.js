/**
 * Created by jaumard on 12/05/2015.
 */
module.exports.policies = {
  'AuthController': {
    'test': ['sessionAuth']
  },
  '*': ['passport', 'sessionAuth'],
  'auth': {
    '*': ['passport']
  }
};
