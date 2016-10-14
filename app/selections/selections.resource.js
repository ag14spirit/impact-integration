'use strict';

angular
    .module('app.selections')
    .factory('selectionsResource', selectionsResource);

selectionsResource.$inject = ['$resource'];

/* @ngInject */
function selectionsResource($resource) {
    // This is where the backend calls will be made!
    return $resource('http://localhost:4000/selections', {}, {
        sendApplication: {
            method: 'POST'
        }
    });
}
