angular.module('app.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'templates/signup.html',
                controller: 'signupCtrl'
            })
            .state('edit', {
                url: '/edit',
                templateUrl: 'templates/edit.html',
                controller: 'editCtrl'
            })
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            .state('tab.check', {
                url: '/check',
                views: {
                    'tab-check': {
                        templateUrl: 'templates/check.html',
                        controller: 'checkCtrl'
                    }
                }
            })
            .state('tab.blelist', {
                url: '/blelist',
                views: {
                    'tab-check': {
                        templateUrl: 'templates/ble-list.html',
                        controller: 'bleListCtrl'
                    }
                }
            })
            .state('tab.charts', {
                url: '/charts',
                views: {
                    'tab-charts': {
                        templateUrl: 'templates/charts.html',
                        controller: 'chartsCtrl'
                    }
                }
            })
            .state('tab.about', {
                url: '/about',
                views: {
                    'tab-about': {
                        templateUrl: 'templates/about.html',
                        controller: 'aboutCtrl'
                    }
                }
            })
            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account.html',
                        controller: 'accountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        //TODO 无法注入StorageHelper
        if (localStorage.hasLogin) {
            $urlRouterProvider.otherwise('/tab/check');
        } else {
            $urlRouterProvider.otherwise('/login');
        }
        //$urlRouterProvider.otherwise('/tab/check');
    });
