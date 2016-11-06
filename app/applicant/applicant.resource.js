'use strict';

angular
    .module('app.applicant')
    .factory('applicantResource', applicantResource);

applicantResource.$inject = ['$resource'];

function applicantResource($resource) {
    return $resource('http://localhost:4000/applicant', {}, {
        addApplicant: {
            url: 'http://localhost:4000/applicant/add',
            method: 'POST'
        },
        getApplicant: {
            method: 'GET'
        }
    })


}