var services = angular.module('app.services', []);

services.value('EsConfig', {
    'API_URL': 'http://localhost:8080/es_web/'
});

services.service('StorageHelper', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = angular.toJson(value);
        },
        getObject: function (key) {
            return angular.fromJson($window.localStorage[key] || '{}');
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        }
    }
})
    .service('AccountService', function ($q, $http, $ionicPopup, EsConfig) {
        return {
            register: function (data) {
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "register",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            },
            login: function (data) {
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "login",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            },
            edit: function (data, token) {
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "edit?accountId=" + data.accountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            },
            modifyPasswd: function (data, token) {
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "passwd/modify?accountId=" + data.accountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            }
        };
    })
    .service('PhyIndexService', function ($q, $http, $ionicPopup, EsConfig) {
        return {
            submit: function (data, token) {
                $ionicPopup.alert({
                    title: 'hehe',
                    template: 'submit'
                });
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "phy/submit?accountId=" + data.accountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            }
        }
    })
    .service('BleManager', function (StorageHelper) {
        var manager = this;

        manager.bleList = StorageHelper.getObject('bleList');
        if (!(manager instanceof Array)) {
            manager.bleList = [];
        }

        manager.addBle = function (ble) {
            var exist = false;
            for (var i = 0; i < manager.bleList.length; i++) {
                if (manager.bleList[i].id == ble.id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                manager.bleList.push(ble);
            }
            StorageHelper.setObject('bleList', manager.bleList);
        };
        manager.getBleList = function () {
            return manager.bleList;
        };
        return manager;
    });

