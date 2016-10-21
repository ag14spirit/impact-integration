'use strict';

angular
    .module('app.applications')
    .factory('applicationsResource', applicationsResource);

applicationsResource.$inject = ['$resource'];

/* @ngInject */
function applicationsResource($resource) {
    // This is where the backend calls will be made!
    return $resource('http://localhost:4000/applications', {}, {
        sendApplication: {
            method: 'POST'
        },
        sendTest: {
            url: 'http://70.117.102.80/easy/add/:name',
            method: 'POST',
            params: {
                name: '@name'
            }
        }
    });
}