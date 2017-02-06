'use strict';

angular
    .module('app.applicant')
    .factory('applicantResource', applicantResource);

applicantResource.$inject = ['$resource'];

function applicantResource($resource) {
  //var ipAddress = 'http://70.117.102.80'; //pi
  var ipAddress = 'http://184.72.90.234:4000'; //aws instance
    return $resource(ipAddress + '/applicant', {}, {
        addApplicant: {
            url: ipAddress + '/applicant/add',
            method: 'POST'
        },
        getApplicant: {
            method: 'GET'
        },
        removeApplicant: {
          url: ipAddress + '/applicant/remove/:applicantId',
          method: 'GET',
          params: {
              applicantId: '@applicantId'
          }
        },
        deleteAllApplicants: {
          url: ipAddress + '/applicant/deleteAllApplicants/:password',
          method: 'GET',
          params: {
              password: '@password'
          }
        }
    })


}
