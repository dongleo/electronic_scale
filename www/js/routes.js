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
      .state('index', {
        url: '/index',
        templateUrl: 'templates/index.html',
        controller: 'indexCtrl'
      })
      .state('edit', {
        url: '/edit',
        templateUrl: 'templates/edit.html',
        controller: 'editCtrl'
      })
      .state('blelist', {
        url: '/blelist',
        templateUrl: 'templates/ble-list.html',
        controller: 'bleListCtrl'
      });

    // if none of the above states are matched, use this as the fallback
    //TODO 无法注入StorageHelper
    /*if (localStorage.hasLogin) {
      $urlRouterProvider.otherwise('/index');
    } else {
      $urlRouterProvider.otherwise('/login');
    }*/
    $urlRouterProvider.otherwise('/index');
  });
