'use strict';

angular
    .module('app.applications')
    .factory('applicationsService', applicationsService);

applicationsService.$inject = ['applicationsResource'];

/* @ngInject */
function applicationsService(applicationsResource) {

    return {
        sendApplication: sendApplication
    };

    function sendApplication() {
        console.log('sending application');
        return applicationsResource.sendApplication();
    }

}