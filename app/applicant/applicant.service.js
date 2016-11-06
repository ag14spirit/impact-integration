'use strict';

angular
    .module('app.applicant')
    .factory("applicantService", applicantService);

applicantService.$inject = ['applicantResource'];

function applicantService (applicantResource) {

    return {
        addApplicant: addApplicant,
        getApplicant: getApplicant
    };

    function addApplicant(applicant) {
        console.log('Adding applicant: ' + applicant);

        return applicantResource.addApplicant(applicant).$promise;
    }

    function getApplicant(applicantId) {
        console.log('Getting applicant with id: ' + applicantId);

        return applicantResource.addApplicant({applicantId: applicantId}).$promise;
    }

}