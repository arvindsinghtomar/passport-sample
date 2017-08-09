/**
 * Provides LDAP operations with devices.
 * 
 * Author: Arvind Tomar Date: 11/06/2013
 */

function PeopleService(ldapClient) {
	this.ldapClient = ldapClient;
}

module.exports = PeopleService;

PeopleService.prototype.containsPeopleId = function containsPeopleId(inum, callback) {
	var deviceDn = this.ldapClient.getDn('ou=people', 'inum=' + inum);
	this.ldapClient.contains(deviceDn, function(result) {
		callback && callback(result);
	});
};

PeopleService.prototype.getPeopleById = function getPeopleById(inum, callback) {
	var deviceDn = this.ldapClient.getDn('ou=people', 'inum=' + inum);
	this.ldapClient.get(deviceDn, function(entry) {
		callback && callback(entry);
	});
};

PeopleService.prototype.addPeople = function addPeople(useinfo,callback) {
	var deviceDn = this.ldapClient.getDn('ou=people', 'inum=' + useinfo.inum);
	var attrs = {
		'inum' : useinfo.inum,
		'displayName' : useinfo.displayName,
		'givenName' : useinfo.givenName,
		'mail' : useinfo.email,
		'sn':useinfo.sn,
		'website':useinfo.website,
		'zoneinfo':useinfo.zoneinfo,
		'gender':useinfo.gender,
		'profile':useinfo.profile,
		'middleName':useinfo.middle_name,
		'locale':useinfo.locale,
		'picture':useinfo.picture,
		'updatedAt':useinfo.updated_at,
		'nickname':useinfo.family_name,
		'preferredUsername':useinfo.preferred_username,
		'address' : JSON.stringify(useinfo.address),
		'objectClass' : [ 'top', 'gluuPerson' ]};

    Object.keys(attrs).forEach(function (key) {
        if(typeof attrs[key] === 'undefined'){
            delete attrs[key];
        }
    });
	this.ldapClient.add(deviceDn, attrs, function(result) {
		callback && callback(result);
	});
};

PeopleService.prototype.deleteinum = function deleteinum(inum, callback) {
	var deviceDn = this.ldapClient.getDn('ou=people', 'inum=' + inum);
	this.deletePeopleDn(deviceDn, callback);
};

PeopleService.prototype.deletePeopleDn = function deleteDeviceDn(deviceDn, callback) {
	this.ldapClient.del(deviceDn, function(result) {
		callback && callback(result);
	});
};
