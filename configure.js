'use strict';

var passport = require('passport');

module.exports = function ToConfigure(sails) {
  return function configure() {
    sails.log('loading strategy config');
    sails.config.passport = {
      local: {
        name: 'Test login',
        strategy: require('passport-local').Strategy,
        options: {}
      },

      /*  bearer: {
              strategy: require('passport-http-bearer').Strategy
            },

            twitter: {
              name: 'Twitter',
              protocol: 'oauth',
              strategy: require('passport-twitter').Strategy,
              options: {
                consumerKey: 'your-consumer-key',
                consumerSecret: 'your-consumer-secret'
              }
            },

            github: {
              name: 'GitHub',
              protocol: 'oauth2',
              strategy: require('passport-github').Strategy,
              options: {
                clientID: 'your-client-id',
                clientSecret: 'your-client-secret'
              }
            },

            facebook: {
              name: 'Facebook',
              protocol: 'oauth2',
              strategy: require('passport-facebook').Strategy,
              options: {
                clientID: 'your-client-id',
                clientSecret: 'your-client-secret',
                scope: ['email'] */
      /* email is necessary for login behavior */
      /*    }
            },
          */
      // To use this strategy we need to register our applications at:
      //
      google: {
        name: 'Raven (Oauth) 2',
        protocol: 'oauth2',
        strategy: require('passport-google-oauth').OAuth2Strategy,
        options: {
          clientID: '478534695836-p9t3vspc54dq9n9mfabv2i9sfvl5k2gg.apps.googleusercontent.com',
          clientSecret: 'Oq--g_aFrwDjED3FDUx9JP2G',
          scope: 'email',
          hostedDomain: 'cam.ac.uk'
        }
      },
      // To use this strategy we need to register our application at:
      // https://metadata.raven.cam.ac.uk/
      // after generating the file from eg.  /Shibboleth.sso/Metadata
      /*saml: {
            name: "Shibboleth",
            protocol: "saml",
            strategy: require("passport-saml").Strategy,
            options: {
              path: "/auth/saml/callback",
              entryPoint: "https://shib.raven.cam.ac.uk/idp/profile/SAML2/Redirect/SSO",
              issuer: "passport-saml"
            }
          },*/
      /*
            cas: {
              name: 'CAS',
              protocol: 'cas',
              strategy: require('passport-cas').Strategy,
              options: {
                ssoBaseURL: 'http://your-cas-url',
                serverBaseURL: 'http://localhost:1337',
                serviceURL: 'http://localhost:1337/auth/cas/callback'
              }
            },

          */

      /* take alook at the ReverseProxy strategy (we would require apache on the front and back)
             And I'm not sure how the hostname would be handled
           */
      /*
      raven: {
        name: 'raven',
        protocol: 'WAAWLS', // NB protocol must be alpha numeric (not WAA->WLS) to store in passport
        strategy: require('passport-raven').Strategy,
        options: {
          audience: 'http://localhost:1337',
          desc: 'Module selection application',
          msg: 'we need to check you are a current student'
          // use demonstration raven server in development
          //debug: process.env.NODE_ENV !== 'production',
          //debug: false
        },

        func: function (crsid, response, cb) {
          console.dir(response);
          console.log('login with crsid: ' + crsid);
          cb(null, {
            crsid: crsid,
            isCurrent: response.isCurrent
          });
        }
      }*/
      /*
            reverseproxy: {
          	name: 'Proxy',
          	protocol: 'PROXY',
          	strategy: require('passport-reverseproxy'),
             	options: {
          		headers: {
                		'X-Forwarded-User': { alias: 'username', required: true },
                	//	'X-Forwarded-UserEmail': { alias: 'email', required: false }
              		}
            	}
           }
          */
    };
  };
};
