var services = angular.module('app.services', []);

services.value('EsConfig', {
    //'API_URL': 'http://app.slmbio.com:8080/es_web/'
    'API_URL': 'http://appadmin.slmbio.com:8080/es_web/'
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
    .service('PhyIndexService', function ($q, $http, $ionicPopup, StorageHelper, EsConfig) {
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
                var _bmirank,
                    _weightrank,
                    _fatratiorank,
                    _noFatWeight,
                    _whr,
                    _bmr,
                    _boneWeight,
                    _smr,
                    _water,
                    _bodyAge,
                    _noFatWeightRank,
                    _whrRank,
                    _bmrRank,
                    _boneWeightRank,
                    _smrRank,
                    _waterRank,
                    _bodyAgeRank;

                function _bmiScore() {
                    var bmi = phyIdx.bmi;
                    if (bmi < 18.5) {
                        _bmirank = -1;
                    } else if (bmi >= 24) {
                        _bmirank = 1;
                    } else {
                        _bmirank = 0;
                    }
                }

                function _weightScore() {
                    var weight = phyIdx.weight;
                    var standard = _get_standard_weight();
                    var ratio = (weight - standard) / standard;
                    if (ratio <= 0.1 && ratio >= -0.1) {
                        _weightrank = 0;
                    } else if (ratio < -0.1) {
                        _weightrank = -1;
                    } else if (ratio <= 0.2) {
                        _weightrank = 1;
                    } else if (ratio <= 0.3) {
                        _weightrank = 2;
                    } else if (ratio <= 0.5) {
                        _weightrank = 3;
                    } else {
                        _weightrank = 4;
                    }
                }

                function _get_standard_weight() {
                    if (userData.height < 165) {
                        return userData.height - 100;
                    } else if (userData.height >= 166 && userData.height < 175) {
                        return userData.height - 105;
                    } else {
                        return userData.height - 110;
                    }
                }

                function _fatratioScore() {
                    var funs = [femalefatscore, malefatscore];

                    function malefatscore() {
                        if (phyIdx.fatRatio <= 11) {
                            _fatratiorank = -1;
                        } else if (phyIdx.fatRatio <= 20) {
                            _fatratiorank = 0;
                        } else if (phyIdx.fatRatio <= 25) {
                            _fatratiorank = 1;
                        } else {
                            _fatratiorank = 2;
                        }
                    }

                    function femalefatscore() {
                        if (phyIdx.fatRatio <= 21) {
                            _fatratiorank = -1;
                        } else if (phyIdx.fatRatio <= 25) {
                            _fatratiorank = 0;
                        } else if (phyIdx.fatRatio <= 30) {
                            _fatratiorank = 1;
                        } else {
                            _fatratiorank = 2;
                        }
                    }

                    return funs[userData.gender]();
                }

                function _calcNoFatWeight() {
                    _noFatWeight = (phyIdx.weight * (1 - phyIdx.fatRatio / 100)).toFixed(1);
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
                    _bmr = calBmrs[userData.gender]().toFixed(1);
                    if (_bmr >= standards[userData.gender]()) {
                        _bmrRank = 0;
                    } else {
                        _bmrRank = -1;
                    }
                }

                function _whrScore() {
                    function maleWhrScore(whr) {
                        if (whr >= 0.9) {
                            _whrRank = 1;
                        } else {
                            _whrRank = 0;
                        }
                    }

                    function femaleWhrScore(whr) {
                        if (whr >= 0.85) {
                            _whrRank = 1;
                        } else {
                            _whrRank = 0;
                        }
                    }

                    _whr = (userData.waistline / userData.hipline).toFixed(1);
                    var funs = [femaleWhrScore, maleWhrScore];
                    funs[userData.gender](_whr);
                }

                function _boneWeightScore() {
                    function _calcBoneWeight() {
                        if (phyIdx.weight < 41) {
                            _boneWeight = 1.8;
                        } else if (phyIdx.weight < 45) {
                            _boneWeight = 2.0;
                        } else if (phyIdx.weight < 50) {
                            _boneWeight = 2.1;
                        } else if (phyIdx.weight < 55) {
                            _boneWeight = 2.2;
                        } else if (phyIdx.weight < 60) {
                            _boneWeight = 2.4;
                        } else if (phyIdx.weight < 65) {
                            _boneWeight = 2.6;
                        } else if (phyIdx.weight < 75) {
                            _boneWeight = 2.7;
                        } else if (phyIdx.weight < 85) {
                            _boneWeight = 2.9;
                        } else if (phyIdx.weight < 95) {
                            _boneWeight = 3.1;
                        } else if (phyIdx.weight < 105) {
                            _boneWeight = 3.3;
                        } else if (phyIdx.weight < 115) {
                            _boneWeight = 3.5;
                        } else {
                            _boneWeight = 3.7;
                        }
                    }

                    function _maleBoneWeightRank(bw) {
                        if (userData.age < 21) {
                            if (bw < 2.0) {
                                _boneWeightRank = -1;
                            } else if (bw < 4.1) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 30) {
                            if (bw < 2.1) {
                                _boneWeightRank = -1;
                            } else if (bw < 4.0) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 40) {
                            if (bw < 1.8) {
                                _boneWeightRank = -1;
                            } else if (bw < 4.0) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 50) {
                            if (bw < 1.9) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.8) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 60) {
                            if (bw < 1.9) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.7) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else {
                            if (bw < 1.6) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.7) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        }
                    }

                    function _femaleBoneWeightRank(bw) {
                        if (userData.age < 21) {
                            if (bw < 1.8) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.9) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 30) {
                            if (bw < 1.8) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.8) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 40) {
                            if (bw < 1.5) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.8) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 50) {
                            if (bw < 1.6) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.7) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else if (userData.age < 60) {
                            if (bw < 1.5) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.6) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        } else {
                            if (bw < 1.3) {
                                _boneWeightRank = -1;
                            } else if (bw < 3.5) {
                                _boneWeightRank = 0;
                            } else {
                                _boneWeightRank = 1;
                            }
                        }
                    }

                    var funs = [_femaleBoneWeightRank, _maleBoneWeightRank];
                    _calcBoneWeight();
                    funs[userData.gender](_boneWeight);
                }

                function _smrScore() {
                    function _calcSmr() {
                        var factor = phyIdx.bmi > 21.2 ? (21.2 / phyIdx.bmi) : (phyIdx.bmi / 21.2);
                        _smr = userData.gender ? (56 * factor) : (46 * factor);
                        _smr = _smr.toFixed(1)
                    }

                    function _maleSmrRank() {
                        if (_smr < 49) {
                            _smrRank = -1;
                        } else if (_smr < 59) {
                            _smrRank = 0;
                        } else {
                            _smrRank = 1;
                        }
                    }

                    function _femaleSmrRank() {
                        if (_smr < 40) {
                            _smrRank = -1;
                        } else if (_smr < 50) {
                            _smrRank = 0;
                        } else {
                            _smrRank = 1;
                        }
                    }

                    var funs = [_femaleSmrRank, _maleSmrRank];
                    _calcSmr();
                    funs[userData.gender]();
                }

                function _waterScore() {
                    function _maleWaterFactor() {
                        if (userData.age < 11) {
                            return 18.3;
                        } else if (userData.age < 16) {
                            return 34.6;
                        } else if (userData.age < 21) {
                            return 39.5;
                        } else if (userData.age < 26) {
                            return 39.3;
                        } else if (userData.age < 31) {
                            return 41.7;
                        } else if (userData.age < 36) {
                            return 41.8;
                        } else if (userData.age < 41) {
                            return 41.2;
                        } else if (userData.age < 46) {
                            return 41.3;
                        } else if (userData.age < 51) {
                            return 42.0;
                        } else if (userData.age < 56) {
                            return 42.0;
                        } else if (userData.age < 61) {
                            return 41.8;
                        } else {
                            return 39.9;
                        }
                    }

                    function _femaleWaterFactor() {
                        if (userData.age < 11) {
                            return 18.5;
                        } else if (userData.age < 16) {
                            return 27.7;
                        } else if (userData.age < 21) {
                            return 28.6;
                        } else if (userData.age < 26) {
                            return 28.3;
                        } else if (userData.age < 31) {
                            return 29.6;
                        } else if (userData.age < 36) {
                            return 28.2;
                        } else if (userData.age < 41) {
                            return 29.6;
                        } else if (userData.age < 46) {
                            return 29.5;
                        } else if (userData.age < 51) {
                            return 30.8;
                        } else if (userData.age < 56) {
                            return 30.3;
                        } else if (userData.age < 61) {
                            return 30.3;
                        } else {
                            return 29.6;
                        }
                    }

                    function _maleWaterRank(water) {
                        if (userData.age < 17) {
                            if (water < 57) {
                                _waterRank = -1;
                            } else if (water < 62) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 30) {
                            if (water < 56.5) {
                                _waterRank = -1;
                            } else if (water < 61.5) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 40) {
                            if (water < 56) {
                                _waterRank = -1;
                            } else if (water < 61) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 60) {
                            if (water < 55.5) {
                                _waterRank = -1;
                            } else if (water < 60.5) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 99) {
                            if (water < 55) {
                                _waterRank = -1;
                            } else if (water < 60) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        }
                    }

                    function _femaleWaterRank(water) {
                        if (userData.age < 17) {
                            if (water < 54) {
                                _waterRank = -1;
                            } else if (water < 60) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 30) {
                            if (water < 53.5) {
                                _waterRank = -1;
                            } else if (water < 59.5) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 40) {
                            if (water < 53) {
                                _waterRank = -1;
                            } else if (water < 59) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 60) {
                            if (water < 52.5) {
                                _waterRank = -1;
                            } else if (water < 58.5) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        } else if (userData.age < 99) {
                            if (water < 52) {
                                _waterRank = -1;
                            } else if (water < 58) {
                                _waterRank = 0;
                            } else {
                                _waterRank = 1;
                            }
                        }
                    }

                    var factorfuns = [_femaleWaterFactor, _maleWaterFactor];
                    _water = factorfuns[userData.gender]() / phyIdx.weight * 100 - 5;
                    _water = _water.toFixed(1);
                    var funs = [_femaleWaterRank, _maleWaterRank];
                    funs[userData.gender](_water);
                }

                function _bodyAgeScore() {
                    if (phyIdx.bmi < 18.6) {
                        _bodyAge = userData.age - 1;
                    } else if (phyIdx.bmi < 19.5) {
                        _bodyAge = userData.age - 2;
                    } else if (phyIdx.bmi < 20.5) {
                        _bodyAge = userData.age - 4;
                    } else if (phyIdx.bmi < 21.5) {
                        _bodyAge = userData.age - 6;
                    } else if (phyIdx.bmi < 22.5) {
                        _bodyAge = userData.age - 4;
                    } else if (phyIdx.bmi < 23.5) {
                        _bodyAge = userData.age - 2;
                    } else if (phyIdx.bmi < 24.5) {
                        _bodyAge = userData.age;
                    } else if (phyIdx.bmi < 25.5) {
                        _bodyAge = userData.age + 1;
                    } else if (phyIdx.bmi < 26.5) {
                        _bodyAge = userData.age + 2;
                    } else if (phyIdx.bmi < 27.5) {
                        _bodyAge = userData.age + 3;
                    } else if (phyIdx.bmi < 28.5) {
                        _bodyAge = userData.age + 4;
                    } else if (phyIdx.bmi < 29.5) {
                        _bodyAge = userData.age + 5;
                    } else if (phyIdx.bmi < 30.5) {
                        _bodyAge = userData.age + 7;
                    } else {
                        _bodyAge = userData.age + 10;
                    }

                    if (userData.age <= _bodyAge) {
                        _bodyAgeRank = 0;
                    } else {
                        _bodyAgeRank = 1;
                    }
                }

                function _calcScore() {
                    var s;
                    if (phyIdx.bmi < 21.3) {
                        s = 99 * phyIdx.bmi / 21.2;
                    } else if (phyIdx.bmi < 23.9) {
                        s = 99 * 21.2 / phyIdx.bmi;
                    } else if (phyIdx.bmi < 25.9) {
                        s = 96 * 21.2 / phyIdx.bmi;
                    } else if (phyIdx.bmi < 27.9) {
                        s = 93 * 21.2 / phyIdx.bmi;
                    } else if (phyIdx.bmi < 29.9) {
                        s = 89 * 21.2 / phyIdx.bmi;
                    } else {
                        s = 85 * 21.2 / phyIdx.bmi;
                    }
                    return s.toFixed(1);
                }

                function _calcScoreRatio(score) {
                    if (score < 51) {
                        return 2.8;
                    } else if (score < 53) {
                        return 3.6;
                    } else if (score < 56) {
                        return 4.8;
                    } else if (score < 59) {
                        return 6.7;
                    } else if (score < 62) {
                        return 8.9;
                    } else if (score < 65) {
                        return 13.8;
                    } else if (score < 68) {
                        return 18.5;
                    } else if (score < 71) {
                        return 24.6;
                    } else if (score < 74) {
                        return 28.6;
                    } else if (score < 77) {
                        return 32.6;
                    } else if (score < 80) {
                        return 38.4;
                    } else if (score < 83) {
                        return 45.6;
                    } else if (score < 86) {
                        return 52.4;
                    } else if (score < 89) {
                        return 65.0;
                    } else if (score < 92) {
                        return 78.7;
                    } else if (score < 95) {
                        return 85.3;
                    } else if (score < 98) {
                        return 94.6;
                    } else {
                        return 98.2;
                    }
                }

                _bmiScore();
                _weightScore();
                _fatratioScore();
                _calcNoFatWeight();
                _bmrScore();
                _whrScore();
                _boneWeightScore();
                _smrScore();
                _waterScore();
                _bodyAgeScore();

                phyIdx.score = _calcScore();
                phyIdx.scoreRatio = _calcScoreRatio(phyIdx.score);
                //phyIdx.scoreRatio =

                phyIdx.weightRank = _weightrank;
                phyIdx.bmiRank = _bmirank;
                phyIdx.fatRatioRank = _fatratiorank;

                phyIdx.noFatWeight = _noFatWeight;
                phyIdx.whr = _whr;
                phyIdx.bmr = _bmr;
                phyIdx.boneWeight = _boneWeight;
                phyIdx.smr = _smr;
                phyIdx.water = _water;
                phyIdx.bodyAge = _bodyAge;
                phyIdx.noFatWeightRank = _noFatWeightRank;
                phyIdx.whrRank = _whrRank;
                phyIdx.bmrRank = _bmrRank;
                phyIdx.boneWeightRank = _boneWeightRank;
                phyIdx.smrRank = _smrRank;
                phyIdx.waterRank = _waterRank;
                phyIdx.bodyAgeRank = _bodyAgeRank;

                return phyIdx;
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
            queryHistory: function (accountId, startDate, endDate, mode) {
                var parentAccountId = StorageHelper.get('parentAccountId');
                var token = StorageHelper.get('token');
                return $http({
                    method: 'POST',
                    url: EsConfig.API_URL + "phy/history?accountId=" + parentAccountId + "&token=" + token,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: angular.toJson({
                        accountId: accountId,
                        startDate: startDate,
                        endDate: endDate,
                        mode: mode
                    })
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

