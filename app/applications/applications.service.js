'use strict';

angular
    .module('app.applications')
    .factory('applicationsService', applicationsService);

applicationsService.$inject = ['applicationsResource'];

/* @ngInject */
function applicationsService(applicationsResource) {

    return {
        sendApplication: sendApplication,
        getApplication: getApplication
    };

    function sendApplication(application) {
        console.log('sending application');
        return applicationsResource.sendApplication(application);
    }

    function getApplication(appID) {
        console.log('Getting application from id: ' + appID);
        return applicationsResource.getApplication({ appID: appID });
    }

}