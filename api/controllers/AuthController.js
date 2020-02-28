var passport = require('passport');

/**
 * Authentication Controller
 *
 * handles requests for
 *
 * G /auth/:provider/:action
 * G /auth/:provider
 * P /auth/:provider
 * P /logout
 * GP /login
 *
 *
 */
var AuthController = {
  test: function (req, res) {
    res.send('Hello World  - - - - - - -  ?!');
  },

  /**
   * Render the login page
   *
   * @param {Object} req
   * @param {Object} res
   */
  login: function (req, res) {
    var strategies = req._sails.config.passport.strategies;
    var providers = {};

    // Get a list of available providers for use in your templates.
    Object.keys(strategies).forEach((key) => {

      // Do not use if configSpecifies valid strategies
      // TODO: an option which can be used to force a strategy
      //if (sails.config.passportStrategies && !sails.config.passportStrategies.includes(key)) {
      //  return;
      //}

      providers[key] = {
        name: strategies[key].name,
        slug: key
      };
    });

    // Render the `auth/login.ext` view
    res.view(req._sails.config.passport.login_view, {
      layout: req._sails.config.passport.layout,
      providers: providers,
      errors: req.flash('error')
    });
  },

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function (req, res) {
    req.logout();

    // mark the user as logged out for auth purposes
    req.session.authenticated = false;
    res.redirect('/');
  },

  /**
     * Render the registration page
     *
     * Just like the login form, the registration form is just simple HTML:
     *
        <form role="form" action="/auth/local/register" method="post">
          <input type="text" name="username" placeholder="Username">
          <input type="text" name="email" placeholder="Email">
          <input type="password" name="password" placeholder="Password">
          <button type="submit">Sign up</button>
        </form>
     *
     * @param {Object} req
     * @param {Object} res
     */
  register: function (req, res) {
    res.view({
      errors: req.flash('error')
    });
  },

  /**
   * Create a third-party authentication endpoint
   *
   * (if local then redirect to our own local view)
   *
   * @param {Object} req
   * @param {Object} res
   */
  provider: function (req, res) {
    if (req.param('provider') === 'local') {
      return res.view('auth/local', {});
    } else {
      passport.endpoint(req, res);
    }
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {

    function tryAgain(err) {
      // Only certain error messages are returned via req.flash('error', someError)
      // because we shouldn't expose internal authorization errors to the user.
      // We do return a generic error and the original request body.
      var flashError = req.flash('error')[0];

      if (err && !flashError) {
        req.flash('error', 'Error.Passport.Generic');
      } else if (flashError) {
        req.flash('error', flashError);
      }
      req.flash('form', req.body);

      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      //var action = req.param('action');
      // only allow login via local strategy
      //      switch (action) {
      //        case 'register':
      //          res.redirect('/register');
      //          break;
      //        case 'disconnect':
      //          res.redirect('back');
      //          break;
      //        default:
      res.redirect('/login');
    }


    passport.callback(req, res, (err, user, challenges, statuses) => {
      if (err || !user) {
        return tryAgain(challenges);
      }
      req.login(user, (err) => {
        if (err) {
          return tryAgain(err);
        }
        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;

        // If the user has just bee created - we may want some more info before provding them further access?
        if (req._sails.config.passport.userVerifyRedirect && (user.display_name === undefined || user.display_name === '')) {
          res.redirect(req._sails.config.passport.userVerifyRedirect); // currently MemberController
        } else {
          if (req.session.redirect_to) {
            res.redirect(req.session.redirect_to);
          } else {
            // TODO: Provide a function cf onUserCreated maybe redirect on login?
            // to redirect the user types
            //if manager

            //if proxy

            //if student
            res.redirect(req._sails.config.passport.siteIndex);
          }
        }
      });
    });
  },

  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res) {
    passport.disconnect(req, res);
  }
};

module.exports = AuthController;
