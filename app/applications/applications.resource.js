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
        }
    });
}