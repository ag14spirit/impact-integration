'use strict';

// Declare app level module which depends on views, and components

var app = angular.module('app', [
    'app.core',
    'app.admin',
    'app.applicant',
    'app.interview'
]).config(function($stateProvider, stateHelperProvider, $urlRouterProvider) {
    stateHelperProvider
    //without a url element in state, basically just changes what html is rendered
        .state({
            name: 'error',
            //url: '/error',
            templateUrl: '/core/error.html'
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
        });

        // catches bad routes and sends them to the otherwise state
        $urlRouterProvider.otherwise('/login');
});
