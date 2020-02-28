# sails-hook-passport-cued

Based on: [sails-hook-passport](https://github.com/jaumard/sails-hook-passport) (Which as since been deprecated)

Implement passport.js strategies to log your users with twitter, facebook, google and more...

# INSTALL

Install it with npm :

    npm install --save sails-hook-passport-cued

or

    npm install --save git+https://github.com/S-Stephen/sails-hook-passport-cued.git

You need to install all strategies you want to use :

npm install --save passport-local passport-twitter passport-facebook

The Hook will generate:

- a passport service (which should be converted to a Helper),
- models (User and Passport),
- actions (albeit v1 actions),
- routes,
- policies,
- middleware (for serialising the user from the session),
- login pages.

## CONFIGURE

### Models

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

Add translation on your config/locales/...

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

Enable passport strategies on config/passport.js file :

```
module.exports.passport = {
redirect :
{
login : "/",//Login successful
logout : "/"//Logout successful
},
layout : "layout", //Specify the layout file for auth views
passwordResetTokenValidity : 86400000, //Link to reset password is good the next 24h after asking
onUserCreated : function (user, providerInfos)//providerInfos is infos from twitter/facebook...
{
//Send email for example
},
onUserLogged : function (session, user)
{
//Set user infos in session for example
},
onUserAskNewPassword : function (req, userData, callback)
{
//You can here send an email, an example of email template is available under /views/auth/emails
//var protocol = req.connection.encrypted ? 'https' : 'http';
//var baseUrl = protocol + '://' + req.headers.host + '/';
//Use your favorite email sender :)
//don't forget to call the callback with optional error parameter
//URL to call : resetPassword?email=<%=user.email%>&token=user.mdpToken
callback();
},
strategies : {
local : {
strategy : require('passport-local').Strategy
},

twitter : {
name : 'Twitter',
protocol : 'oauth',
strategy : require('passport-twitter').Strategy,
options : {
consumerKey : 'your-consumer-key',
consumerSecret : 'your-consumer-secret'
}
},

facebook : {
name : 'Facebook',
protocol : 'oauth2',
strategy : require('passport-facebook').Strategy,
options : {
clientID : 'your-client-id',
clientSecret : 'your-client-secret',
scope : ['email'] /_ email is necessary for login behavior _/
}
},

google : {
name : 'Google',
protocol : 'oauth2',
strategy : require('passport-google-oauth').OAuth2Strategy,
options : {
clientID : 'your-client-id',
clientSecret : 'your-client-secret'
}
}
}
};
```

You can log and register on /login and /register routes.

###WARNING
Don't install passport on your sails projet or hook will not working anymore. If you really need passport on your sails project remove passport from sails-hook-passport-cued module
