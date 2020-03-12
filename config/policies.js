/**
 * Created by jaumard on 12/05/2015.
 */
module.exports.policies = {
  'AuthController': {
    'test': ['sessionAuth'],
    '*': ['passport']
  },
  '*': ['passport', 'sessionAuth'] // insists all requests generate a passport session
};
