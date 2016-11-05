'use strict';

angular
    .module('app.interview')
    .factory('interviewResource', interviewResource);

interviewResource.$inject = ['$resource'];

function interviewResource($resource) {
    return $resource('http://localhost:4000/interview', {}, {
        queryDay: {
            url: "http://localhost:4000/interview/day/:day/availability",
            method: 'GET',
            isArray: true,
            params: {
                day: '@day'
            }
        },
        queryAll: {
            method: 'GET'
        },
        getInterview: {
            url: "http://localhost:4000/interview/:interviewId",
            method: 'GET',
            params: {
                interviewId: '@interviewId'
            }
        }

    });
}