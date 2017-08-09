/**
 * Ldap helper.
 *
 * Author: Yuriy Movchan Date: 11/07/2013
 */

var async = require('async');
var LdapClient = require('../ldap/client.js');
var ApplicationService = require('./service/application-service.js');
var DeviceService = require('./service/device-service.js');
var EntryService = require('./service/entry-service.js');
var PeopleService = require('./service/people-service.js');

var BASE_DN = 'o='+global.config.clientId.substring(0,global.config.clientId.length-15)+',o=gluu';
if (!BASE_DN) {
	throw new Error("LDAP_BASE_DN environment variable isn't set!");
}

var ldapClient = new LdapClient(BASE_DN);
var entryService = new EntryService(ldapClient);

module.exports = {
	ldapClient : ldapClient,
	entryService : entryService,
	applicationService : new ApplicationService(ldapClient),
	deviceService : new DeviceService(ldapClient),
    peopleService : new PeopleService(ldapClient),
    prepareDefaultEntires : prepareDefaultEntires,
};

function prepareDefaultEntires(callback) {
	if (typeof (callback) !== 'function') {
		throw new TypeError('Callback (function) required');
	}

	async.series([ function(done) {
		var baseDn = ldapClient.getDn('', 'ou=people');

		var entry = {
			ou : 'push',
			objectclass : [ 'top', 'organizationalUnit' ]
		};

		entryService.addEntryIfNotExist(baseDn, entry, done);
	}
	]);
}
