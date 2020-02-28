module.exports = function (req, crsid, response, next) {
  //var query   = {};

  sails.log("in raven protocols/raven.js why can we not pass our query variable?");
  var query1 = {
    identifier: crsid,
    protocol: 'WAAWLS' // note this has to be alpha numeric to store in the passport (ie not WAA->WLS)
      ,
    provider: 'raven',
    username: crsid,
    emails: [{
      value: crsid + "@cam.ac.uk"
    }],
    tokens: {
      sig: response.sig
    }
    //  , tokens     : { accessToken: accessToken }
  };
  var query2 = {
    identifier: crsid,
    protocol: 'WAAWLS' // note this has to be alpha numeric to store in the passport (ie not WAA->WLS)
      ,
    provider: 'raven',
    username: crsid,
    emails: [{
      value: crsid + "@cam.ac.uk"
    }],
    tokens: {
      sig: response.sig
    }
    //  , tokens     : { accessToken: accessToken }
  };

  response.identifier = crsid;
  response.protocol = 'WAAWLS';
  response.provider = 'raven';
  response.username = crsid;
  response.emails = [{
    value: crsid + "@cam.ac.uk"
  }];
  response.tokens = {
    sig: response.sig
  };

  sails.log("raven login query1.protocol: " + query1.protocol + " req: " + req);
  passport.connect(req, query1, response, next);
};