(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .config(['$locationProvider', '$stateProvider', '$urlRouterProvider',
            function ($locationProvider, $stateProvider, $urlRouterProvider) {
                $locationProvider.html5Mode(true);
                $stateProvider
                    .state('login', {
                        url: '/login',
                        title: 'Sign In - BakedMonitor',
                        templateUrl: 'app/login.html',
                        controller: 'LoginCtrl'
                    });
                $stateProvider
                    .state('edit', {
                        url: '/edit/:resourceId',
                        title: 'Edit Servers',
                        templateUrl: 'app/edit.html',
                        controller: 'EditCtrl'
                    });
                $stateProvider
                    .state('monitor', {
                        url: '/monitor/:serverId',
                        title: 'Monitor',
                        templateUrl: 'app/monitor.html',
                        controller: 'MonitorCtrl'
                    });
                $stateProvider
                    .state('profile', {
                        url: '/profile',
                        title: 'Edit Profile',
                        templateUrl: 'app/profile.html',
                        controller: 'ProfileCtrl'
                    });
                $urlRouterProvider.otherwise('login');
            }]);
})();