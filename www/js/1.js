angular.module('ionicApp', ['ionic'])

  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('eventmenu', {
        url: "/event",
        abstract: true,
        templateUrl: "templates/event-menu.html"
      })
      .state('eventmenu.shirtsize', {
        url: "/shirtsize",
        views: {
          'menuContent': {
            templateUrl: "templates/shirtsize.html",
            controller: "ShirtSizeCtrl"
          }
        }
      })
      .state('eventmenu.checkin', {
        url: "/check-in",
        views: {
          'menuContent': {
            templateUrl: "templates/check-in.html",
            controller: "CheckinCtrl"
          }
        }
      })

    $urlRouterProvider.otherwise("/event/check-in");
  })

  .controller('CheckinCtrl', function($scope, $state, myshirt) {

    $scope.data = {shirtSize: myshirt.size};

    //$scope.refreshData = function() {
    //	  $scope.data = {shirtSize: myshirt.size};
    //}

  })

  .controller('ShirtSizeCtrl', function($scope, $state, myshirt) {

    $scope.shirtSizeList = [
      {text: 'Large',value: 'L'},
      {text: 'Medium',value: 'M'},
      {text: 'Small',value: 'S'}];

    $scope.data = {shirtSize: myshirt.size};

    $scope.sizechanged = function(item) {
      myshirt.updateSize(item.value);
      $state.go('eventmenu.checkin');
    };

  })

  .service("myshirt", function MyShirt() {
    var myshirt = this;
    myshirt.size = 'S';
    myshirt.updateSize = function(value){
      this.size = value;
    }
  })
;
