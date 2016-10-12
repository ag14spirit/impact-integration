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


    function test() {
        console.log('Testing');
    }

    function sendApp() {
        applicationsService.sendApplication();
    }

}
