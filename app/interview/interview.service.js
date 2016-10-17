'use strict';

angular
    .module('app.interview')
    .factory('interviewService', interviewService);

interviewService.$inject = ['interviewResource'];

function interviewService(interviewResource) {
    return {
        query: query
    };

    function query(date) {
        console.log('querying for interviews');
        return interviewResource.query(date).$promise;
    }

}