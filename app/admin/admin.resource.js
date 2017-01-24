'use strict';

angular
    .module('app.admin')
    .factory('adminResource', adminResource);

adminResource.$inject = ['$resource'];

function adminResource($resource) {
    var ipAddress = 'http://70.117.102.80';
    return $resource(ipAddress + '/admin', {}, {
        verifyLogin: {
            url: ipAddress + '/admin/:password',
            method: 'GET',
            params: {
                password: '@password'
            }
        }
    })
}
