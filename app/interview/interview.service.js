'use strict';

angular
    .module('app.interview')
    .factory('interviewService', interviewService);

interviewService.$inject = ['interviewResource'];

function interviewService(interviewResource) {
    return {
        queryDay: queryDay,
        queryAll: queryAll,
        getInterview: getInterview,
        assignApplicantToInterview: assignApplicantToInterview
    };

    function queryDay(day) {
        console.log('querying for interviews on ' + day);
        return interviewResource.queryDay({day: day}).$promise;
    }

    function queryAll() {
        console.log('querying for all interviews')
    }

    function getInterview(id) {
        console.log('querying for specific interview with id: ' + id);
        return interviewResource.getInterview({interviewId: id}).$promise;
    }

    function assignApplicantToInterview(interview, applicant) {
        console.log('adding ' + applicant + ' to interview with id = ' + interview.id);
        return interviewResource.assignApplicantToInterview({interviewId: interview.id}, applicant).$promise;
    }

}