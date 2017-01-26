'use strict';

angular
    .module('app.admin')
    .factory('adminResource', adminResource);

adminResource.$inject = ['$resource'];

function adminResource($resource) {
    //var ipAddress = 'http://70.117.102.80'; //pi
    var ipAddress = 'http://184.72.90.234:4000'; //aws instance
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
