'use strict';

angular
    .module('app.applications')
    .controller('ApplicationsController', ApplicationsController);

ApplicationsController.$inject = ['applicationsService'];

/* @ngInject */
function ApplicationsController(applicationsService) {

    var vm = this;
    vm.test = test;
    vm.sendApp = sendApp;
    vm.getApp = getApp;

    vm.buttonText = 'Send App!';
    vm.responseText = 'Test';

    vm.applicationForm = {};


    function test() {
        console.log('Testing');
    }

    function sendApp() {
        console.log(vm.application);
        vm.responseText = applicationsService.sendApplication(vm.application);
    }

    function getApp() {
        vm.applicationResp = applicationsService.getApplication(vm.application.id);
    }

}
