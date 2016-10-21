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

    vm.buttonText = 'Send App!';
    vm.user = {};


    function test() {
        applicationsService.sendTest(vm.user.name);
    }

    function sendApp() {
        applicationsService.sendApplication();
    }

}
