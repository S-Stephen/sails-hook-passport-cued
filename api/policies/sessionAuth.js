/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = async function (req, res, next) {
    //if(typeof req.user !== 'undefined' && !req.user.inactive){
    if (typeof req.user !== 'undefined') {
        if (!req.user.inactive) {
            if (req.session.impersonateID) {
                // NB as well as setting up impersonateId we expect the calling app
                // to set an 'originalUser' or similar variable 
                // and manage the removal of impersonateID
                req.user = await User.findOne({ id: req.session.impersonateID });
            }
            // attempt to provide access to the view (via layout.ejs)
            res.locals.user = req.user;
            return next();
        } else {
            return res.redirect('/inactived_account');
        }
    }

    // provide 401 though TODO add the WWW-Authenticate: header
    // https://stackoverflow.com/questions/1653493
    return res.status(401).set('WWW-Authenticate','Oauth realm='+req._sails.config.passport.hostname).send({message: 'unknown user - timeout?'})
    
};
