var path = require("path");
var url = require("url");
var passport = require("passport");

/**
 * Passport Service
 *
 * A painless Passport.js service for your Sails app that is guaranteed tofUser
 * Rock Your Socks™. It takes all the hassle out of setting up Passport.js by
 * encapsulating all the boring stuff in two functions:
 *
 *   passport.endpoint()
 *   passport.callback()
 *
 * The former sets up an endpoint (/auth/:provider) for redirecting a user to a
 * third-party provider for authentication, while the latter sets up a callback
 * endpoint (/auth/:provider/callback) for receiving the response from the
 * third-party provider. All you have to do is define in the configuration which
 * third-party providers you'd like to support. It's that easy!
 *
 * Behind the scenes, the service stores all the data it needs within "Pass-
 * ports". These contain all the information required to associate a local user
 * with a profile from a third-party provider. This even holds true for the good
 * ol' password authentication scheme – the Authentication Service takes care of
 * encrypting passwords and storing them in Passports, allowing you to keep your
 * User model free of bloat.
 */

// Load authentication protocols
passport.protocols = require("./protocols");

/**
 * Connect a third-party profile to a local user
 *
 * This is where most of the magic happens when a user is authenticating with a
 * third-party provider. What it does, is the following:
 *
 *   1. Given a provider and an identifier, find a matching Passport.
 *   2. From here, the logic branches into two paths.
 *
 *     - A user is not currently logged in:
 *       1. If a Passport wasn't found, create a new user as well as a new
 *          Passport that will be assigned to the user.
 *       2. If a Passport was found, get the user associated with the passport.
 *
 *     - A user is currently logged in:
 *       1. If a Passport wasn't found, create a new Passport and associate it
 *          with the already logged in user (ie. "Connect")
 *       2. If a Passport was found, nothing needs to happen.
 *
 * As you can see, this function handles both "authentication" and "authori-
 * zation" at the same time. This is due to the fact that we pass in
 * `passReqToCallback: true` when loading the strategies, allowing us to look
 * for an existing session in the request and taking action based on that.
 *
 * For more information on auth(entication|rization) in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 * http://passportjs.org/guide/authorize/
 *
 * @param {Object}   req
 * @param {Object}   query
 * @param {Object}   profile
 * @param {Function} next
 */
passport.connect = async function (req, query, profile, next) {
  var user = {};
  var provider;

  // TODO: try-catch errors eg:
  //   key not existing in a model
  // ...
  // Get the authentication provider from the query.
  query.provider = req.param("provider");

  // Use profile.provider or fallback to the query.provider if it is undefined
  // as is the case for OpenID, for example
  provider = profile.provider || query.provider;

  // If the provider cannot be identified we cannot match it to a passport so
  // throw an error and let whoever's next in line take care of it.
  if (!provider) {
    return next(new Error("No authentication provider was identified."));
  }

  // If the profile object contains a list of emails, grab the first one and
  // add it to the user.
  if (profile.hasOwnProperty("emails")) {
    user.email = profile.emails[0].value;
  }
  // If the profile object contains a username, add it to the user.

  if (profile.hasOwnProperty("username")) {
    user.username = profile.username;
  } else if (user.email.includes(sails.config.passport.removeEmailDomain)) {
    user.username = user.email.replace(
      sails.config.passport.removeEmailDomain,
      ""
    );
  } else {
    user.username = user.email;
  }
  // If neither an email or a username was available in the profile, we don't
  // have a way of identifying the user in the future. Throw an error and let
  // whoever's next in the line take care of it.
  if (!user.username && !user.email) {
    return next(new Error("Neither a username nor email was available"));
  }

  var mypass = await Passport.findOne({
    provider: provider,
    identifier: query.identifier.toString()
  });

  if (!req.user) {
    // no user in the session
    if (!mypass) {
      // no passport - as you would expect
      var myuser = await User.findOrCreate({
          username: user.username
        },
        user
      );
      query.user = myuser.id;
      //create a new passport
      await Passport.create(query);
      //if (sails.config.passport.onUserCreated) {
      // TODO: implement onUserCreate
      //  // This can be included in the config
      //  // - however the user may have existed (findOrCreate)
      //  sails.config.passport.onUserCreated(user, profile);
      //}
      next(null, myuser);
    } else {
      if (query.hasOwnProperty("tokens") && query.tokens !== passport.tokens) {
        await Passport.update({
          id: mypass.id
        }).set({
          tokens: query.tokens
        });
      }
      //var pass1 = await mypass.save();
      var user = await User.findOne({
        id: mypass.user
      });
      next(null, user);
    }
  } else {
    if (!mypass) {
      query.user = req.user.id;
      await Passport.create(query);
    }
    next(null, req.user);
  }

};

/**
 * Create an authentication endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param  {Object} req
 * @param  {Object} res
 */
passport.endpoint = function (req, res) {
  var strategies = sails.config.passport.strategies;
  var provider = req.param("provider");
  var options = {
    successRedirect: "/index",
    passReqToCallback: 1
  };

  // If a provider doesn't exist for this endpoint, send the user back to the
  // login page
  if (!strategies.hasOwnProperty(provider)) {
    return res.redirect("/login");
  }

  // Attach scope if it has been set in the config
  if (strategies[provider].hasOwnProperty("scope")) {
    options.scope = strategies[provider].scope;
  }

  if (strategies[provider].options.hasOwnProperty("hostedDomain")) {
    options.hostedDomain = strategies[provider].options.hostedDomain;
  }
  // Redirect the user to the provider for authentication. When complete,
  // the provider will redirect the user back to the application at
  //     /auth/:provider/callback
  this.authenticate(provider, options)(req, res, req.next);
};

/**
 * Create an authentication callback endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
passport.callback = function (req, res, next) {
  var provider = req.param("provider") ? req.param("provider") : "raven"; //, 'raven') //'local')
  //var provider = req.param("provider", "local");
  var action = req.param("action");

  // Passport.js wasn't really built for local user registration, but it's nice
  // having it tied into everything else.
  // We do not provide local authentication - atm (salt and hash required)
  /*if (provider === "local" && action !== undefined) {
    if (action === "register" && !req.user) {
      this.protocols.local.register(req, res, next);
    } else if (action === "connect" && req.user) {
      this.protocols.local.connect(req, res, next);
    } else if (action === "disconnect" && req.user) {
      this.disconnect(req, res, next);
    } else {
      next(new Error("Invalid action"));
    }
  } else {*/
  if (action === "disconnect" && req.user) {
    this.disconnect(req, res, next);
  } else {
    // The provider will redirect the user to this URL after approval. Finish
    // the authentication process by attempting to obtain an access token. If
    // access was granted, the user will be logged in. Otherwise, authentication
    // has failed.
    this.authenticate(provider, next)(req, res, req.next);
  }
  //}
};

/**
 *
 * For more information on the providers supported by Passport.js, check out:
 * http://passportjs.org/guide/providers/
 *
 */
passport.loadStrategies = function () {
  var self = this;
  var strategies = sails.config.passport.strategies;

  Object.keys(strategies).forEach(key => {
    // only load the strategy if status === 'active'
    if (strategies[key].status !== 'active') {
      return;
    }

    var options = {
      passReqToCallback: true
    };
    var Strategy;

    if (key === "local") {
      // Since we need to allow users to login using both usernames as well as
      // emails, we'll set the username field to something more generic.
      _.extend(options, {
        usernameField: "identifier"
      });

      //Let users override the username and passwordField from the options
      _.extend(options, strategies[key].options || {});

      // Only load the local strategy if it's enabled in the config
      if (strategies.local) {
        Strategy = strategies[key].strategy;

        self.use(new Strategy(options, self.protocols.local.login));
      }
    } else if (key === "bearer") {
      if (strategies.bearer) {
        Strategy = strategies[key].strategy;
        self.use(new Strategy(self.protocols.bearer.authorize));
      }
    } else if (key == "raven") {
      Strategy = strategies[key].strategy;
      // Options provided here as we utilize .env.NODE_ENV
      _.extend(options, strategies[key].options || {});
      options['debug'] = process.env.NODE_ENV !== "production"
      self.use(
        new Strategy(options,
          self.protocols.raven
        )
      );
    } else {
      var protocol = strategies[key].protocol;
      var callback = strategies[key].callback;

      if (!callback) {
        callback = "auth/" + key + "/callback";
      }

      Strategy = strategies[key].strategy;

      var baseUrl = sails.config.passport.hostname;

      switch (protocol) {
        case "oauth":
        case "oauth2":
          options.callbackURL = url.resolve(baseUrl, callback);
          break;

        case "openid":
          options.returnURL = url.resolve(baseUrl, callback);
          options.realm = baseUrl;
          options.profile = true;
          break;
      }

      // Merge the default options with any options defined in the config. All
      // defaults can be overriden, but I don't see a reason why you'd want to
      // do that.
      _.extend(options, strategies[key].options);

      self.use(new Strategy(options, self.protocols[protocol]));
    }
  });
};

/**
 * Disconnect a passport from a user
 *
 * @param  {Object} req
 * @param  {Object} res
 */
passport.disconnect = function (req, res, next) {
  var user = req.user;
  var provider = req.param("provider", "local");
  var query = {};

  query.user = user.id;
  query[provider === "local" ? "protocol" : "provider"] = provider;

  Passport.findOne(query, (err, passport) => {
    if (err) {
      return next(err);
    }

    Passport.destroy(passport.id, error => {
      if (error) {
        return next(error);
      }

      next(null, user);
    });
  });
};

// A little about the flow:
// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((id, next) => {
  User.findOne(id, next);
});

module.exports = passport;
