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
        },
        containKey: function (key) {
            return $window.localStorage.getItem(key) != null;
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
                    url: EsConfig.API_URL + "delete/" + account.accountId + "?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            getAccount: function (accountId) {
                if (!accountId) {
                    return null;
                }
                var defaultAccount = StorageHelper.getObject('userData');
                if (defaultAccount.accountId == accountId) {
                    return defaultAccount;
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
    .service('PhyIndexService', function ($q, $http, StorageHelper, EsConfig) {
        return {
            calcBMI: function (phyIdx, userData) {
                //return 21.3;
                return (phyIdx.weight / (userData.height * userData.height) * 10000).toFixed(1);
            },
            calcFatRatio: function (phyIdx, userData) {
                return (1.2 * phyIdx.bmi + 0.23 * userData.age - 5.4 - 10.8 * userData.gender).toFixed(1);
                /*var fat;
                 if (userData.gender) {  //男
                 fat = userData.waistline * 0.74 - (phyIdx.weight * 0.082 + 44.74)
                 } else {    //女
                 fat = userData.waistline * 0.74 - (phyIdx.weight * 0.082 + 34.89)
                 }
                 return fat / phyIdx.weight;*/
            },
            calcPhyIdx: function (phyIdx, userData) {
                var _bmiscore, _bmirank,
                    _weightscore, _weightrank,
                    _fatratioscore, _fatratiorank,
                    _bmrscore,
                    _whrscore;

                function _bmiScore() {
                    var bmi = phyIdx.bmi;
                    if (bmi < 18.5) {
                        _bmiscore = 60;
                        _bmirank = 1;
                    } else if (bmi >= 24) {
                        _bmiscore = 60;
                        _bmirank = 2;
                    } else {
                        _bmiscore = 95;
                        _bmirank = 0;
                    }
                }

                function _weightScore() {
                    var weight = phyIdx.weight;
                    var standard = _get_standard_weight();
                    var ratio = (weight - standard) / standard;
                    if (ratio < 0.1 && ratio > -0.1) {
                        _weightrank = 0;
                        _weightscore = 95;
                    } else {
                        if (ratio > 0) {
                            _weightrank = 1;
                        } else {
                            _weightrank = 2;
                        }
                        ratio = math.abs(ratio);
                        if (ratio < 0.2) {
                            _weightscore = 70;
                        } else if (ratio < 0.3) {
                            _weightscore = 60;
                        } else if (ratio < 0.5) {
                            _weightscore = 50;
                        } else {
                            _weightscore = 40;
                        }
                    }
                }

                function _get_standard_weight() {
                    if (userData.height < 165) {
                        return phyIdx.weight - 100;
                    } else if (userData.height >= 166 && userData.height < 175) {
                        return phyIdx.weight - 105;
                    } else {
                        return phyIdx.weight - 110;
                    }
                }

                function _fatratioScore() {
                    var funs = [femalefatscore, malefatscore];

                    function malefatscore() {
                        if (phyIdx.fatRatio <= 11) {
                            _fatratiorank = 2;
                            _fatratioscore = 70;
                        } else if (phyIdx.fatRatio <= 20) {
                            _fatratiorank = 0;
                            _fatratioscore = 95;
                        } else if (phyIdx.fatRatio <= 25) {
                            _fatratiorank = 1;
                            _fatratioscore = 70;
                        } else {
                            _fatratiorank = 1;
                            _fatratioscore = 50;
                        }
                    }

                    function femalefatscore() {
                        if (phyIdx.fatRatio <= 21) {
                            _fatratiorank = 2;
                            _fatratioscore = 70;
                        } else if (phyIdx.fatRatio <= 25) {
                            _fatratiorank = 0;
                            _fatratioscore = 95;
                        } else if (phyIdx.fatRatio <= 30) {
                            _fatratiorank = 1;
                            _fatratioscore = 70;
                        } else {
                            _fatratiorank = 1;
                            _fatratioscore = 50;
                        }
                    }

                    return funs[userData.gender]();
                }

                function _bmrScore() {
                    function maleBmr() {
                        if (userData.age < 3) {
                            return phyIdx.weight * 60.9 - 54;
                        } else if (userData.age < 10) {
                            return phyIdx.weight * 22.7 + 495;
                        } else if (userData.age < 18) {
                            return phyIdx.weight * 17.5 + 651;
                        } else if (userData.age < 30) {
                            return phyIdx.weight * 15.3 + 679;
                        } else if (userData.age < 60) {
                            return phyIdx.weight * 11.6 + 879;
                        } else {
                            return phyIdx.weight * 13.5 + 487;
                        }
                    }

                    function maleStandardBmr() {
                        if (userData.age <= 2) {
                            return 700;
                        } else if (userData.age <= 5) {
                            return 900;
                        } else if (userData.age <= 8) {
                            return 1090;
                        } else if (userData.age <= 11) {
                            return 1290;
                        } else if (userData.age <= 14) {
                            return 1480;
                        } else if (userData.age <= 17) {
                            return 1610;
                        } else if (userData.age <= 29) {
                            return 1550;
                        } else if (userData.age <= 49) {
                            return 1500;
                        } else if (userData.age <= 69) {
                            return 1350;
                        } else {
                            return 1220;
                        }
                    }

                    function femaleBmr() {
                        if (userData.age < 3) {
                            return phyIdx.weight * 61.0 - 51;
                        } else if (userData.age < 10) {
                            return phyIdx.weight * 22.5 + 499;
                        } else if (userData.age < 18) {
                            return phyIdx.weight * 12.2 + 746;
                        } else if (userData.age < 30) {
                            return phyIdx.weight * 14.7 + 496;
                        } else if (userData.age < 60) {
                            return phyIdx.weight * 8.7 + 829;
                        } else {
                            return phyIdx.weight * 10.5 + 596;
                        }
                    }

                    function femaleStandardBmr() {
                        if (userData.age <= 2) {
                            return 700;
                        } else if (userData.age <= 5) {
                            return 860;
                        } else if (userData.age <= 8) {
                            return 1000;
                        } else if (userData.age <= 11) {
                            return 1180;
                        } else if (userData.age <= 14) {
                            return 1340;
                        } else if (userData.age <= 17) {
                            return 1300;
                        } else if (userData.age <= 29) {
                            return 1210;
                        } else if (userData.age <= 49) {
                            return 1170;
                        } else if (userData.age <= 69) {
                            return 1110;
                        } else {
                            return 1010;
                        }
                    }

                    var calBmrs = [femaleBmr, maleBmr];
                    var standards = [femaleStandardBmr, maleStandardBmr];
                    if (calBmrs[userData.gender]() > standards[userData.gender]()) {
                        _bmrscore = 90;
                    } else {
                        _bmrscore = 50;
                    }
                }

                function _whrScore() {
                    function maleWhrScore(whr) {
                        if (whr >= 0.9) {
                            _whrscore = 50;
                        } else {
                            _whrscore = 95;
                        }
                    }

                    function femaleWhrScore(whr) {
                        if (whr >= 0.85) {
                            _whrscore = 50;
                        } else {
                            _whrscore = 95;
                        }
                    }

                    var whr = userData.waistline / userData.hipline;
                    var funs = [femaleWhrScore, maleWhrScore];
                    funs[userData.gender](whr);
                }

                _bmiScore();
                _weightScore();
                _fatratioScore();
                _bmrScore();
                _whrScore();

                var _score = (_bmiscore + _weightscore + fatratioscore + _bmrscore + _whrscore) / 5;

                return {
                    // 分数
                    score: parseInt(_score),
                    // 超越用户比例
                    scoreRatio: 80,
                    // 超越用户指标
                    //scoreRank: 2,
                    // 体重指标
                    weightRank: _weightrank,
                    // bmi指标
                    bmiRank: _bmirank,
                    // 体脂指标
                    fatRatioRank: _fatratiorank
                };
            },
            get: function (accountId) {
                var _phyIdxInfo = StorageHelper.getObject('phyIdxInfo');
                return _phyIdxInfo['account_' + accountId];
            },
            set: function (accountId, phy) {
                var _phyIdxInfo = StorageHelper.getObject('phyIdxInfo');
                _phyIdxInfo['account_' + accountId] = phy;

                StorageHelper.setObject('phyIdxInfo', _phyIdxInfo);
            },
            query: function (accountId) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "phy/query/" + accountId + "?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            submit: function (phyIdx, data) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                phyIdx.accountId = data.accountId;
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "phy/submit?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson(phyIdx)
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
        var _state = 'ready';
        var _device_id;
        return {
            _state: 'ready',
            startScan: function (success, failure) {
                if (_state == 'scanning') {
                    ble.stopScan();
                }
                if (_state == 'connect') {
                    this.disconnect();
                }
                var q = $q.defer();
                _state = 'scanning';
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
                _state = 'ready';
                return q.promise;
            },
            connect: function (deviceID, success, failure) {
                var q = $q.defer();
                ble.connect(deviceID, function () {
                    _state = 'connect';
                    _device_id = deviceID;

                    success();
                }, failure);
                return q.promise;
            },
            disconnect: function () {
                var q = $q.defer();
                ble.disconnect(_device_id, function (result) {
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

