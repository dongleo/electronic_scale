// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app',
    ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova', 'chart.js', 'swipe'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })
    .config(function ($ionicConfigProvider, ChartJsProvider) {
        //set header and tabs
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.navBar.alignTitle('center');
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
            responsive: true
        });
        // Configure all doughnut charts
        ChartJsProvider.setOptions('Doughnut', {
            animateScale: true
        });
    })
    .filter('rankfilter', function() {
        return function(rank) {
            if (rank > 0) {
                return '↑';
            } else if (rank < 0) {
                return '↓';
            } else {
                return '';
            }
        }
    }).filter('weightfilter', function () {
        return function (weightRank) {
            weightRank = weightRank || -1;
            var dic = ['偏瘦', '达标', '超重', '轻度肥胖', '中度肥胖', '重度肥胖'];
            return dic[weightRank + 1];
        }
    }).filter('bmifilter', function () {
        return function (bmiRank) {
            bmiRank = bmiRank || -1;
            var dic = ['偏低', '达标', '偏高'];
            return dic[bmiRank + 1];
        }
    }).filter('fatfilter', function () {
        return function (fatRank) {
            fatRank = fatRank || -1;
            var dic = ['偏低', '达标', '偏高', '严重超标'];
            return dic[fatRank + 1];
        }
    }).filter('bmrfilter', function () {
        return function (bmrRank) {
            bmrRank = bmrRank || -1;
            var dic = ['不达标', '达标'];
            return dic[bmrRank + 1];
        }
    }).filter('waterfilter', function () {
        return function (waterRank) {
            waterRank = waterRank || -1;
            var dic = ['偏低', '达标', '偏高'];
            return dic[waterRank + 1];
        }
    }).filter('smrfilter', function () {
        return function (smrRank) {
            smrRank = smrRank || -1;
            var dic = ['偏低', '达标', '偏高'];
            return dic[smrRank + 1];
        }
    }).filter('bodyagefilter', function () {
        return function (bodyAgeRank) {
            bodyAgeRank = bodyAgeRank || 1;
            var dic = ['达标', '不达标'];
            return dic[bodyAgeRank];
        }
    }).filter('boneweightfilter', function () {
        return function (boneWeightRank) {
            boneWeightRank = boneWeightRank || -1;
            var dic = ['偏低', '达标', '偏高'];
            return dic[boneWeightRank + 1];
        }
    }).filter('whrfilter', function () {
        return function (whrRank) {
            whrRank = whrRank || 1;
            var dic = ['达标', '不达标'];
            return dic[whrRank];
        }
    });
