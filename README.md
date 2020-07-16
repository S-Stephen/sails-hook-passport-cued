# sails-hook-passport-cued

Based on: [sails-hook-passport](https://github.com/jaumard/sails-hook-passport) (Which has since been deprecated)

Implement passport.js strategies to log your users with local, google and more...

# INSTALL

First uninstall Passport if it exists in the local application:

    npm uninstall passport

Install it with npm :

    npm install --save sails-hook-passport-cued

or

    npm install --save git+https://github.com/S-Stephen/sails-hook-passport-cued.git

or from a branch, tag or commit (for testing purposes)

    npm install --save git+https://github.com/S-Stephen/sails-hook-passport-cued.git#<branch|tag|commit name>


You need to install all strategies you want to use :

npm install --save passport-local passport-google-oauth passport-raven

The Hook will generate:

- a passport service (TODO: which should be converted to a Helper),
- models (User and Passport),
- actions (albeit v1 actions),
- routes,
- policies,
- middleware (for serialising the user from the session),
- login pages.

## CONFIGURE

## Models

A \*Passport() Model will generated and loaded automatically into your datastore

A basic _User_ model will also be generated with the following fields:

```
var User =
{
  schema : true,
  attributes : {
    id: { type: 'number', autoIncrement: true, }
    username  : {
      type   : 'string',
      unique : true,
      required : true,
    },
    // If this is not set then the user has self registered
    display_name : {
      type: 'string',
      required : false
    },
    passports : {
      collection : 'Passport',
      via        : 'user'
    }
  }
};
```

**You can override this model by creating a User.js under your api/models folder and add more attributes and callbacks.**

You may wish to add translation on your config/locales/...

    {
        "Error.Passport.Password.Invalid": "The provided password is invalid!",
        "Error.Passport.Password.Wrong": "Whoa, that password wasn't quite right!",
        "Error.Passport.Password.NotSet": "Oh no, you haven't set a password yet!",
        "Error.Passport.Username.NotFound": "Uhm, what's your name again?",
        "Error.Passport.User.Exists": "This username is already taken.",
        "Error.Passport.Email.NotFound": "That email doesn't seem right",
        "Error.Passport.Email.Missing": "You need to supply an email-address for verification",
        "Error.Passport.Email.Exists": "This email already exists. So try logging in.",
        "Error.Passport.Username.Missing": "You need to supply a username",
        "Error.Passport.Password.Missing": "Oh no, you haven't set a password yet!",
        "Error.Passport.Generic": "Snap. Something went wrong with authorization.",
        "Error.ResetPassword" : "An error as occurred, please restart the procedure",
        "Error.ResetPassword.Token" : "This link is no more valid, please restart the procedure",
        "Success.ResetPassword" : "Your password is changed successfully",
        "Email.Sent" : "An email was sent to change your password"
    }

Override/Enable passport strategies on config:

At the moment 3 strategies are included:

* local
* Google Oauth
* Ucamwebauth

To have any of these strategies loaded you must set their _status: 'active'_ in the passport.strategies config. This can be done in several files with the usual Sails [precedence](https://sailsjs.com/documentation/concepts/configuration)

1. Commandline option eg sails lift --passport.strategies.google.status='active'
1. Environment varaibles eg sails_passport_strategies_google_status='active'
1. .sailsrc in app dirctory
1. .sailsrc in ~/.sailsrc
1. config/local.js
1. config/env/*.js
1. config/!(local)*.js (these are our regular app/config files)

*Note* as an extra precaution if you wish to use the local strategy - for testing purposes only (passwords are not hashed) then you must also set *passport.strategy.allowLocal = true*;

## Config 
### http.js

Include *passportCuedInit* and *passportCuedSession* in the http.middleware.order array (after *session*) eg:

```
  order: [
    ...
    session,
    passportCuedInit,
    passportCuedsession,
    ...
  ]
```

### passport.js

The config in [config/passport.js](./config/passport.js) will be loaded and can be overriden in an app/env/*js or app/local.js file eg

```
module.exports.passport = {

  // a new user has been created - where do we direct them (we may not want auto enrol)
  userVerifyRedirect: '/member/confirmacc', // page to forward unverified accounts to
  // If this email domain exists remove from the username
  removeEmailDomain: '<remove @.domain address>',
  // Our index page
  siteIndex: '/index',
  hostname: 'http://localhost:1337', // our hostname
  loginView: '../node_modules/sails-hook-passport-cued/templates/auth/login', // login page
  loginLocal: '../node_modules/sails-hook-passport-cued/templates/auth/local', // local login page
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
      status: 'active', // needs setting to active for strategy to be loaded
      name: 'Raven Test (local)'
    },
    google: {
      status: 'active',
      name: 'Raven Oauth',
      options: {
        clientID: '<Your client ID>',
        clientSecret: '<Your client secret>',
        scope: 'email',
        hostedDomain: 'cam.ac.uk'
      }
    },
    raven: {
      status: 'active',
      name: 'Raven (Ucamwebauth)',
      options: {
        audience: 'http://localhost:1337',
        desc: 'My Application',
        msg: 'we need to check you are a current student'
      }
    }
  }
};
```

### policies.js

These are produced to require all requests generate a passport and manage the AuthController requests

### routes.js

Added to handle the login / logouts / callback flow


You can NOT login and register at /login and /register routes.

###WARNING
Don't install passport on your sails project or hook will not working anymore. If you really need passport on your sails project remove passport from sails-hook-passport-cued module
