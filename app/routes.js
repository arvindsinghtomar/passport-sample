var authParams = require('../config/auth');
var request = require('request');
// load the strategy we need
var OICStrategy = require('./Strategy').Strategy
// load up the user model
var User = require('../app/models/user');
var request = require("request");
var redis = require("redis");
const uuidv4 = require('uuid/v4');
client = redis.createClient();

Ff
module.exports = function (app, passport, request, ipAddress) {
// normal routes ===============================================================
    var pass = passport;
    // show the home page (will also have our login links)
    app.get('/proxy', function (req, res) {
        res.render('index.ejs');
    });

    // authenticate the client with issuer info received
    app.post('/proxy', function (req, res) {
        request.get('http://' + ipAddress + '/auth/openidconnect?issuer=' + req.body.issuer, function (error, response, body) {
            res.writeHead(response.statusCode, response.headers);
            res.write(body);
            res.end();
        });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        var uuid = uuidv4();
        client.set(uuid, req.user.inum, 'EX', 1000);

        res.redirect('http://localhost:3000/profile' + '?token=' + uuid);


        //
        // res.render('profile.ejs', {
        //     user: req.user
        // });


    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect(req.query.redirect_uri);
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================


    // openidconnect --------------------------------

    // send to openidconnect to do the authentication
    // app.get('/auth/openidconnect', passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'}));
    app.get('/auth/openidconnect',
        authenticate, pass.authenticate('passport-openid-connect', {successRedirect: "/profile"}),

        function (req, res) {

        }
    )
    ;


    function authenticate(req, res, next) {
        var clientID = req.query.clientID;
        var basestate = req.query.state;

        var state = JSON.parse(new Buffer(basestate, 'base64').toString('ascii'));


        var client;
        if (global.passportStrategies) {

            Object.keys(global.passportStrategies).forEach(function (key) {

                if (global.passportStrategies[key].clientID === clientID && global.passportStrategies[key].issuer === state.op) {
                    client = global.passportStrategies[key];
                }

            });

        }

        if (client) {
            var oic = new OICStrategy({
                "issuerHost": client.issuer,
                "client_id": client.clientID,
                "client_secret": client.clientSecret,
                "redirect_uri": authParams.opendidConnect.redirect_uri,
                "scope": authParams.opendidConnect.scope
            });

            pass.use(oic);
            next();
        }
        else {
            next("invalid clientid")
        }

    }


    // handle the callback after openidconnect has authenticated the user
    app.get('/auth/openidconnect/callback', passport.authenticate('passport-openid-connect', {
        successRedirect: '/profile',
        callback: true,
        failureRedirect: '/proxy'
    }));
    // }), callbackResponse);
    app.get('/userinfo', function (req, res) {

        getDetailFromRedis(req.query.token, function (error, data) {
            if (!error && data) {

                var ldap_helper = require('../server');
                ldap_helper.peopleService.getPeopleById(data, function (result) {
                    if (result) {
                        res.status(200);
                        res.send((JSON.stringify(result)));
                    }
                    else {
                        res.status(403);
                        res.send('invalid  or expired  token ')
                    }
                });


            }
            else {
                res.status(403);
                res.send('invalid  or expired  token ')
            }
        })

        //
        // res.render('profile.ejs', {
        //     user: req.user
        // });


    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/proxy');
}


function getDetailFromRedis(id, callback) {
    client.get(id, callback);

}

