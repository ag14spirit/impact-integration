'use strict';

// Declare app level module which depends on views, and components
/*angular.module('app', [
    'ngRoute', 'ui.router', 'ui.router.stateHelper',
    'app.view1',
    'app.view2',
    'app.shell'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/view2'});
}]);*/


var app = angular.module('app', [
    'app.core',
    'app.admin',
    'app.applications',
    'app.applicant',
    'app.view1',
    'app.interview'
]).config(function($stateProvider, stateHelperProvider, $urlRouterProvider) {
    stateHelperProvider
    //without a url element in state, basically just changes what html is rendered
        .state({
            name: 'view1',
            url: '/view1',
            templateUrl: '/view1/view1.html'
        })
        .state({
            name: 'applications',
            url: '/applications',
            templateUrl: '/applications/applications.html',
            controller: 'ApplicationsController as vm'
        })
        .state({
            name: 'interview',
            url: '/interview',
            templateUrl: '/interview/interview.html',
            controller: 'InterviewController as vm',
            // Default applicant
            params: {
                applicant: {}
            }
            //   applicant: {
            //       firstName : "Bob",
            //       lastName : "Sagot",
            //       emailAddress : "bsag@gmail.com",
            //       gender : true
            //   }
            // }
        })
        .state({
            name: 'login',
            url: '/login',
            templateUrl: '/core/login.html'
        })
        .state({
            name: 'closed',
            url: '/closed',
            templateUrl: '/core/signups-closed.html'
        })
        .state({
            name: 'admin',
            url: '/admin',
            templateUrl: '/admin/admin.html',
            controller: 'AdminController as vm'
        })
        .state({
            name: 'otherwise',
            url: '/otherwise',
            template: '<h3>hello</h3>'
        });

        // catches bad routes and sends them to the otherwise state
        $urlRouterProvider.otherwise('/login');
});
