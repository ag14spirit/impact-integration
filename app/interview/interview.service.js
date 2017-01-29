'use strict';

angular
    .module('app.interview')
    .factory('interviewService', interviewService);

interviewService.$inject = ['interviewResource'];

function interviewService(interviewResource) {
    return {
        queryDay: queryDay,
        queryDayAdmin: queryDayAdmin,
        queryAll: queryAll,
        getInterview: getInterview,
        getAllFullInterviews: getAllFullInterviews,
        addInterview: addInterview,
        removeInterview: removeInterview,
        assignApplicantToInterview: assignApplicantToInterview,
        removeApplicantToInterview: removeApplicantToInterview,
        removeAllAppsFromInterviews: removeAllAppsFromInterviews,
        deleteAllInterviews: deleteAllInterviews
    };

    function queryDay(day) {
        console.log('querying for interviews on ' + day);
        return interviewResource.queryDay({day: day}).$promise;
    }

    function queryDayAdmin(day) {
        console.log('querying for interviews on ' + day);
        return interviewResource.queryDayAdmin({day: day}).$promise;
    }

    function queryAll() {
        console.log('querying for all interviews');
        return interviewResource.queryAll().$promise;
    }

    function getInterview(id) {
        console.log('querying for specific interview with id: ' + id);
        return interviewResource.getInterview({interviewId: id}).$promise;
    }

    function assignApplicantToInterview(interview, applicant) {
        console.log('adding ' + applicant + ' to interview with id = ' + interview.id);
        return interviewResource.assignApplicantToInterview({interviewId: interview.id}, applicant).$promise;
    }
    function removeApplicantToInterview(interview, applicant) {
        console.log('removing ' + applicant + ' from interview with id = ' + interview.id);
        return interviewResource.removeApplicantToInterview({interviewId: interview.id}).$promise;
    }
    function removeAllAppsFromInterviews(password) {
        console.log('Removing All Applicants from Interviews');
        return interviewResource.removeAllAppsFromInterviews({password: password}).$promise;
    }

    function addInterview(interview){
      console.log('adding interviews to database');
      return interviewResource.addInterview(interview).$promise;
    }

    function removeInterview(id){
      console.log('removing interview from database with id: ' + id);
      return interviewResource.removeInterview({interviewId: id}).$promise;
    }

    function getAllFullInterviews(){
      console.log('grabbing all full interviews');
      return interviewResource.getAllFullInterviews().$promise;
    }

    function deleteAllInterviews(password){
      console.log('Deleting All Interviews (Database Reset)');
      return interviewResource.deleteAllInterviews({password: password}).$promise;
    }

}
