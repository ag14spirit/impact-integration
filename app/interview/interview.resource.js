'use strict';

angular
    .module('app.interview')
    .factory('interviewResource', interviewResource);

interviewResource.$inject = ['$resource'];

function interviewResource($resource) {
    return $resource('http://localhost:4000/interview', {}, {
        query: {
            method: 'GET'
        }
    });
}