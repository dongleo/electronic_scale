var services = angular.module('app.services', []);

services.value('EsConfig', {
    'API_URL': 'http://app.slmbio.com:8080/es_web/'
});

services.service('StorageHelper', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage.setItem(key, value);
        },
        get: function (key, defaultValue) {
            return $window.localStorage.getItem(key) || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage.setItem(key, angular.toJson(value));
        },
        getObject: function (key) {
            return angular.fromJson($window.localStorage.getItem(key) || '{}');
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        clear: function () {
            $window.localStorage.clear();
        }
    }
})
    .service('AccountService', function ($q, $http, $ionicPopup, StorageHelper, EsConfig) {
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
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    data: angular.toJson(data)
                });
            },
            edit: function (data) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "edit?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            },
            modifyPasswd: function (data) {
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "passwd/modify?accountId=" + data.accountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            },
            addNewAccount: function (data) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "addNewAccount?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(data)
                });
            },
            getAccountList: function () {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "getAccountList?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            deleteAccount: function (account) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "delete/" +  account.accountId + "?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            getAccount: function (accountId) {
                if (!accountId) {
                    return null;
                }
                var accountList = StorageHelper.getObject('accountList');
                for (var i = 0; i < accountList.length; i++) {
                    if (accountId == accountList[i].accountId) {
                        return accountList[i];
                    }
                }
                return null;
            }
        };
    })
    .service('PhyIndexService', function ($q, $http, $ionicPopup, StorageHelper, EsConfig) {
        return {
            calcBMI: function (userData) {
                return 21.3;
                //return userData.weight / (userData.height * userData.height) * 10000;
            },
            calcFatRatio: function (userData) {
                return 0.23;
                /*var fat;
                 if (userData.gender) {  //男
                 fat = userData.waistline * 0.74 - (userData.weight * 0.082 + 44.74)
                 } else {    //女
                 fat = userData.waistline * 0.74 - (userData.weight * 0.082 + 34.89)
                 }
                 return fat / userData.weight;*/
            },
            submit: function (data) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                $ionicPopup.alert({
                    title: 'submit',
                    template: 'submit data'
                });
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "phy/submit?accountId=" + parentAccountId + "&token=" + token,
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
        if (!(manager.bleList instanceof Array)) {
            manager.bleList = [];
        }
        manager.addBle = function (ble) {
            if (!manager.exist(ble)) {
                manager.bleList.push(ble);
            }
            StorageHelper.setObject('bleList', manager.bleList);
            manager.selectedBle = ble;
        };
        manager.getBleList = function () {
            return manager.bleList;
        };
        manager.exist = function (ble) {
            var exist = false;
            for (var i = 0; i < manager.bleList.length; i++) {
                if (manager.bleList[i].id == ble.id) {
                    exist = true;
                    break;
                }
            }
            return exist;
        };
        return manager;
    })
    .service('BleService', function ($q) {
        return {
            _state: 'ready',
            startScan: function (success, failure) {
                if (this._state == 'scanning') {
                    ble.stopScan();
                }
                var q = $q.defer();
                this._state = 'scanning';
                ble.startScan(success, failure);
                //return q.promise;
            },
            stopScan: function () {
                var q = $q.defer();
                ble.stopScan(function () {
                    q.resolve();
                }, function (error) {
                    q.reject(error);
                });
                this._state = 'ready';
                return q.promise;
            },
            connect: function (deviceID, success, failure) {
                var q = $q.defer();
                ble.connect(deviceID, success, failure);
                return q.promise;
            },
            disconnect: function (deviceID) {
                var q = $q.defer();
                ble.disconnect(deviceID, function (result) {
                    q.resolve(result);
                }, function (error) {
                    q.reject(error);
                });
                return q.promise;
            },
            startNotification: function (success, failure) {
                //var q = $q.defer();
                ble.startNotification(success, failure);
                //return q.promise;
            },
            stopNotification: function () {
                var q = $q.defer();
                ble.stopNotification(function (result) {
                    q.resolve(result);
                }, function (error) {
                    q.reject(error);
                });
                return q.promise;
            },
            confirmTime: function () {
                var q = $q.defer();
                ble.confirmTime(function (result) {
                    q.resolve(result);
                }, function (error) {
                    q.reject(error);
                });
                return q.promise;
            },
            configWeighingMode: function (unit, mode) {
                var q = $q.defer();
                ble.configWeighingMode(unit, mode, function (result) {
                    q.resolve(result);
                }, function (error) {
                    q.reject(error);
                });
                return q.promise;
            },
            setupParameter: function (id, sex, age, height) {
                var q = $q.defer();
                ble.setupParameter(id, sex, age, height, function (result) {
                    q.resolve(result);
                }, function (error) {
                    q.reject(error);
                });
                return q.promise;
            }
        };
    });

