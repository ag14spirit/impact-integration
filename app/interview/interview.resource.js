'use strict';

angular
    .module('app.interview')
    .factory('interviewResource', interviewResource);

interviewResource.$inject = ['$resource'];

function interviewResource($resource) {
  //var ipAddress = 'http://70.117.102.80'; //pi
  var ipAddress = 'http://184.72.90.234:4000'; //aws instance
    return $resource(ipAddress + '/interview', {}, {
        queryDay: {
            url: ipAddress + "/interview/day/:day/availability",
            method: 'GET',
            isArray: true,
            params: {
                day: '@day'
            }
        },
        queryDayAdmin: {
            url: ipAddress + "/interview/day/:day/",
            method: 'GET',
            isArray: true,
            params: {
                day: '@day'
            }
        },
        queryAll: {
            url: ipAddress + "/interview/all",
            isArray: true,
            method: 'GET'
        },
        getInterview: {
            url: ipAddress + "/interview/:interviewId",
            method: 'GET',
            params: {
                interviewId: '@interviewId'
            }
        },
        removeInterview: {
            url: ipAddress + "/interview/remove/:interviewId",
            method: 'GET',
            params: {
                interviewId: '@interviewId'
            }
        },
        assignApplicantToInterview: {
            url: ipAddress + '/interview/assignApplicant/:interviewId',
            method: 'POST',
            params: {
                interviewId: '@interviewId'
            }
        },
        removeApplicantToInterview: {
            url: ipAddress + '/interview/removeApplicant/:interviewId',
            method: 'POST',
            params: {
                interviewId: '@interviewId'
            }
        },
        removeAllAppsFromInterviews: {
            url: ipAddress + '/interview/removeAllApplicants',
            method: 'GET',
            params: {
                password: '@password'
            }
        },
        addInterview: {
          url: ipAddress + '/interview/add',
          method: 'POST'
        },
        getAllFullInterviews:{
          url: ipAddress + '/interview/all_full',
          isArray: true,
          method: 'GET'
        },
        deleteAllInterviews:{
          url: ipAddress + '/interview/deleteAllInterviews',
          method: 'GET',
          params: {
              password: '@password'
          }
        }

    });
}
