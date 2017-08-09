// load up the user model
var User = require('../app/models/user');
// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.inum);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        var ldap_helper = require('../server');
        ldap_helper.peopleService.getPeopleById(id, function (result) {
            if (result) {
                done(null, result);
            }
        });
    });
}
