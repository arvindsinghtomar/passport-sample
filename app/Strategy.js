"use strict";


var
    openid = require('openid-client'),
    passport = require('passport'),
    util = require('util');


var OICStrategy = function (config) {
    this.name = 'passport-openid-connect';
    this.config = config || {}
    this.client = null
    this.tokenSet = null


}

util.inherits(OICStrategy, passport.Strategy)


OICStrategy.prototype.init = function () {
    if (!this.config.issuerHost) {
        throw new Error("Could not find requried config options issuerHost in openid-passport strategy initialization")
    }
    return Promise.resolve().then(() => {
            openid.Issuer.defaultHttpOptions = {timeout: 5000};
            return openid.Issuer.discover(this.config.issuerHost)
        }
    )
        .then((issuer) => {
            this.client = new issuer.Client(this.config)
        })
        .catch((err) => {
            console.error("ERROR", err);
            OICStrategy.prototype.init()
        })
}

OICStrategy.prototype.authenticate = function (req, opts) {
    this.init()
        .then(() => {
            if (opts.callback
            ) {
                return this.callback(req, opts)
            }

            var authurl = this.client.authorizationUrl(this.config)
            this.redirect(authurl)
            console.log("Initialization of OpenID Connect discovery process completed.")
        })
    ;

}

OICStrategy.prototype.getUserInfo = function () {
    this.client.defaultHttpOptions = {timeout: 5000};
    return this.client.userinfo(this.tokenSet.access_token)
        .then((userinfo) => {
            this.userinfo = userinfo
        })
}

OICStrategy.prototype.callback = function (req, opts) {
    var req_query = req.query;
    req.query.state = undefined;
    return this.client.authorizationCallback(this.config.redirect_uri, req.query)
        .then((tokenSet) => {
            this.tokenSet = tokenSet
            return this.getUserInfo()
        })
        .then((userinfo) => {
            var ldap_helper = require('../server');

            var newUser;
            var error;
            var info = this.userinfo;
            info.clientId = this.client;
            return new Promise(function (resolve, reject) {
                ldap_helper.peopleService.containsPeopleId(info.inum, function (msg) {
                    console.log(msg);
                    if (msg != false) {
                        ldap_helper.peopleService.getPeopleById(info.inum, function (result) {
                            console.log("user exists " + result.toString());
                            newUser = result;
                            return resolve(newUser);

                        });
                    }
                    else {
                        ldap_helper.peopleService.addPeople(info, function (msg) {
                            console.log("new entry" + msg.toString());
                            if (msg == false) {
                            }
                            else {
                                newUser = info;
                                return resolve(newUser);

                            }
                        });
                    }
                });
            })

        }).then((newUser) => {
            if (newUser) {
                this.success(newUser);
            }
        })
        .catch((err) => {
            console.error("Error processing callback", err);
            this.fail(err)
            // console.error("Error processing callback", err);
            // res.status(500).send("Error: " + err.message)
        })


}

OICStrategy.prototype.requireAuthentication = function (req, res) {
    if (!this.user) {
        return this.authenticate(req, res)
    }
    return res.redirect(path)
}


exports.Strategy = OICStrategy
