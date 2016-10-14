'use strict';

angular
    .module('app.selections')
    .factory('selectionsService', selectionsService);

selectionsService.$inject = ['selectionsResource'];

/* @ngInject */
function selectionsService(selectionsResource) {

    return {
        sendApplication: sendApplication
    };

    function sendApplication() {
        console.log('sending application');
        return selectionsResource.sendApplication();
    }

}
