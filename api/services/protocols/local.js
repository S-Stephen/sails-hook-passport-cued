var validator = require('validator');
var crypto = require('crypto');

/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 *
 * NOTE: As we are using local to test do not provide use to this function
 * Always populate a passport with know values in the fixtures
 *
 */
exports.register = function (req, res, next) {
  return next(res.serverError('Forbidden: local::register'));
  /*
  var email = req.param('email'),
    username = req.param('username'),
    password = req.param('password');


  if (!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  if (!username) {
    req.flash('error', 'Error.Passport.Username.Missing');
    return next(new Error('No username was entered.'));
  }

  if (!password) {
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  User.create(req.allParams(), function (err, user) {
    if (err) {
      if (err.code === 'E_VALIDATION') {
        if (err.invalidAttributes.email) {
          req.flash('error', 'Error.Passport.Email.Exists');
        } else {
          req.flash('error', 'Error.Passport.User.Exists');
        }
      }

      return next(err);
    }

    // Generating accessToken for API authentication
    var token = crypto.randomBytes(48).toString('base64');

    Passport.create({
      protocol: 'local',
      password: password,
      user: user.id,
      accessToken: token
    }, function (err, passport) {
      if (err) {
        if (err.code === 'E_VALIDATION') {
          req.flash('error', 'Error.Passport.Password.Invalid');
        }

        return user.destroy(function (destroyErr) {
          next(destroyErr || err);
        });
      }
      if (sails.config.passport.onUserCreated) {
        sails.config.passport.onUserCreated(user, {
          provider: 'local'
        });
      }
      next(null, user);
    });
  });*/
};


/**
 * validateLocalPassword
 *
 * Not to be used in production as no hashing of passwords occurs.
 * We do not intend to use the local authentication scheme in production
 *  - at least not yet! (TODO: salt+hash the passowrds when ented into the passport (connect function of local))
 * Compare the plain text value of the passord in the local passport
 */

_validateLocalPassword = function (password, next) {
  if (password === password) {
    next(null, true)
  }
}

/**
 * Allocate local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doens't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 *
 * NOTE: As we are using local to test do not provide use to this function
 * Always populate a passport with know values in the fixtures
 */
exports.connect = function (req, res, next) {

  return next(res.serverError('Forbidden: local::connect'));
  /*
  var user = req.user,
    password = req.param('password');

  Passport.findOne({
    protocol: 'local',
    user: user.id
  }, function (err, passport) {
    if (err) {
      return next(err);
    }

    if (!passport) {
      Passport.create({
        protocol: 'local',
        password: password,
        user: user.id
      }, function (err, passport) {
        next(err, user);
      });
    } else {
      next(null, user);
    }
  });*/
};

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function (req, identifier, password, next) {
  var isEmail = validator.isEmail(identifier),
    query = {};

  if (!req._sails.config.passport.localAuthMethod) {
    req._sails.config.passport.localAuthMethod = "both";
  }

  if (!isEmail && req._sails.config.passport.localAuthMethod == "email") {
    req.flash('error', 'Error.Passport.Email.NotFound');
    return next(null, false);
  }

  if (isEmail && req._sails.config.passport.localAuthMethod == "username") {
    req.flash('error', 'Error.Passport.Username.NotFound');
    return next(null, false);
  }

  if (isEmail) {
    query.email = identifier;
  } else {
    query.username = identifier;
  }

  User.findOne(query, function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      if (isEmail) {
        req.flash('error', 'Error.Passport.Email.NotFound');
      } else {
        req.flash('error', 'Error.Passport.Username.NotFound');
      }

      return next(null, false);
    }

    Passport.findOne({
      protocol: 'local',
      user: user.id
    }, function (err, passport) {
      if (passport) {

        _validateLocalPassword(password, function (err, res) {
          if (err) {
            return next(err);
          }

          if (!res) {
            req.flash('error', 'Error.Passport.Password.Wrong');
            return next(null, false);
          } else {
            return next(null, user);
          }
        });
      } else {
        req.flash('error', 'Error.Passport.Passport.NotSet');
        return next(null, false);
      }
    });
  });
};
