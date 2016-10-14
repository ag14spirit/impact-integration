'use strict';

angular
    .module('app.applications')
    .factory('applicationsResource', applicationsResource);

applicationsResource.$inject = ['$resource'];

/* @ngInject */
function applicationsResource($resource) {
    // This is where the backend calls will be made!
    return $resource('http://localhost:8080', {}, {
        sendApplication: {
            url: 'http://localhost:8080/application',
            method: 'POST'
        },
        getApplication: {
            url: 'http://localhost:8080/application/:appID',
            method: 'GET',
            params: {
                appID: '@appID'
            }
        }
    });
}