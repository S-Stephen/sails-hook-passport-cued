# sails-hook-passport-cued

Based on: [sails-hook-passport](https://github.com/jaumard/sails-hook-passport) (Which as since been deprecated)

Implement passport.js strategies to log your users with local, google and more...

# INSTALL

First uninstall Passport if it exists in the local application:

    npm uninstall passport

Install it with npm :

    npm install --save sails-hook-passport-cued

or

    npm install --save git+https://github.com/S-Stephen/sails-hook-passport-cued.git

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
  // Redirect to use after logout (may rquire JSON return)
  logoutRedirect: '/profile'
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
    //Send email for example - not sure how to use these??
  },
  onUserLogged: function (session, user) {
    //Set user infos in session for example - not sure how to use these??
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

### Impersonating other users.

It is the responsibility of the application to manage whether a user is able to impersonate another user. 

To do so the calling app must: 

*  Ensure that the user to impersonate has a record in the user table  (if not create one) and set the session variable **req.session.impersonateID** to this ID.
*  Store the current user as verified by Passport in the session eg **req.session.originalUser**
* (Optionally on impesonating) switch the **req.user** to be that of the required user


To remove (revert back) the app must:

* Set req.user back to the original user eg (**req.session.originalUser**)
* remove the session variable **req.session.impersonateID**

You can NOT login and register at /login and /register routes.

###WARNING
Don't install passport on your sails project or hook will not working anymore. If you really need passport on your sails project remove passport from sails-hook-passport-cued module

## The flow

### Login

A list of methods is to be provided by your login page, these are to be provided by you application and will be hrefs of the form **'/auth/_strategy_name_'**

eg login.component.html:

```
<p>Welcome to my angular application <span *ngIf="!isProd" >(Test/Staging/Development)</span></p>

<a mat-button mat-raised-button color='primary' href="/auth/google">Login</a>
<a *ngIf="!isProd" mat-button mat-raised-button color='primary' href="/auth/local">Login (local)</a>

```

This hook will load the route **get /auth/:strategy: AuthController.provider** which unless the provider is local will call the **passport.endpoint** which is defined as a service in this hook, this will essentially call the **passport.authenticate** function.

If the provider is **local** the local login form will be returned in which the form is posted to: **/auth/local** which is handled by the route -> **post /auth/:provider: AuthController.callback**

On the other hand where the provider is not local then completion of the **passport.authenticate** flow the client will still be returned back to **/auth/:provider/callback: AuthController.callback**

So following all authentication attempts the client should arrive at **AuthController.callback**.

If there was an error or no user was returned then the user is forwarded to the **login** again via a redirect to __/login__

#### Other places where the user might get redirected to /login

* Via sessionAuth if the user is undefined then th eclient gets redirected to **login**
* Vi Passport (in hook) if calling endpoint the strategy does not exist then the user will be redirected to **login**


### When a user's session times out

When a users session times out **sessionAuth** should return a **401** response (rather than a redirect to **/login**). In which case the frontend errorHandler should redirect the user to the login page.  

For Angular something like the following:

in ErrorHandler.handleError(err: any): void 
```
if ( err.status == 401 ){
    // send some error message to be displayed
    this._message.clearMessages()
    this._message.sendMessage(`Your session appeared to timeout. Please login again`,'information');
    // note (for further processing) that the user has been re-routed
    loginRedirect = true;
    this.router.navigate(['/public/login',{}])
}
```
