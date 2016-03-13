var controllers = angular.module('app.controllers', []);

controllers.value('Conf', {
    'heightDic': [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
    'hipAndWaistlineDic': [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180],
    'DEFAULT_UNIT': 1,
    'DEFAULT_MODE': 0,
    'SCAN_TIMEOUT': 10,
    'LOCK_HEAD': '02'
});

controllers.controller('loginCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, StorageHelper, AccountService, PhyIndexService) {
    if (StorageHelper.get('hasLogin')) {
        $state.go("tab.check");
        return;
    }
    $scope.data = {};
    $scope.login = function () {
        if ($scope.data.tel == undefined || $scope.data.tel == '') {
            $ionicPopup.alert({
                title: '提示',
                template: '手机号不能为空！'
            });
        } else if ($scope.data.password == undefined || $scope.data.password == '') {
            $ionicPopup.alert({
                title: '提示',
                template: '密码不能为空！'
            });
        } else {
            $ionicLoading.show({
                template: 'Loading...'
            });
            AccountService.login($scope.data).success(function (response) {
                if (response.success) {
                    var userData = response.data;
                    if (!userData.accountName) {
                        userData.firstLogin = true;
                    }
                    var phyIdx = response.data.phyIdx;

                    if (phyIdx && phyIdx.accountId) {
                        userData.age = AccountService.calAge(userData.birth);
                        phyIdx = PhyIndexService.calcPhyIdx(phyIdx, userData);
                        PhyIndexService.set(phyIdx.accountId, phyIdx);
                        userData.phyIdx = undefined;
                        userData.scoreRatio = phyIdx.scoreRatio;
                    }
                    StorageHelper.set('hasLogin', true);
                    StorageHelper.set('token', userData.token);
                    StorageHelper.set('parentAccountId', userData.accountId);
                    StorageHelper.setObject('userData', userData);
                    $ionicLoading.hide();
                    $state.go("tab.check");
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '手机号或密码错误，登录失败！'
                    });
                    $ionicLoading.hide();
                }
            }).error(function () {
                $ionicPopup.alert({
                    title: '提示',
                    template: '网络不可用!'
                });
                $ionicLoading.hide();
            });
        }
    };
})

    .controller('signupCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, AccountService) {
        $scope.data = {};
        $scope.register = function () {
            if ($scope.data.tel == undefined || $scope.data.tel == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '手机号不能为空！'
                });
            } else if ($scope.data.password == undefined || $scope.data.password == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '密码不能为空！'
                });
            } else if ($scope.data.passwordCfm == undefined || $scope.data.passwordCfm == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '确认密码不能为空！'
                });
            } else if ($scope.data.passwordCfm != $scope.data.password) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '密码与确认密码不一致！'
                });
            } else {
                $ionicLoading.show({
                    template: 'Loading...'
                });
                AccountService.register($scope.data).success(function (data) {
                    if (data.success) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '注册成功，现在去登录！'
                        }).then(function () {
                            $state.go("login");
                        });
                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '手机号或密码错误，登录失败！'
                        });
                    }
                    $ionicLoading.hide();
                }).error(function () {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '网络不可用！'
                    });
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('checkCtrl', function ($scope, $ionicPlatform, $state, $ionicPopup, $timeout, BleService, AccountService, PhyIndexService, StorageHelper, BleManager, Conf) {
        $scope.goToEdit = function () {
            $state.go('edit');
        };
        $scope.addBle = function () {
            $state.go('tab.blelist');
        };
        $scope.goToDetail = function () {
            if ($scope.waitToScale) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '亲，测量之后才可以查看分析报告哦！'
                });
                return;
            }
            $state.go('phyDetail');
        };
        $scope.init = function () {
            $scope.bleList = BleManager.getBleList();
            $scope.selectedBle = BleManager.selectedBle;

            if ($scope.selectedBle) {
                $scope.connect($scope.selectedBle, $scope.connectFail);
            } else {
                $scope.scan();
            }
        };
        $scope.scan = function () {
            $scope.bleStatus = 1;
            BleService.startScan(function (device) {
                if (BleManager.exist(device)) {
                    $scope.connect(device, $scope.connectFail);
                }
            }, function () {
                $scope.bleStatus = 2;
            });
            $timeout(function () {
                if ($scope.bleStatus == 1) {
                    $scope.bleStatus = 2;
                    BleService.stopScan();
                }
            }, Conf.SCAN_TIMEOUT * 1000);
        };
        $scope.connect = function (device, failure) {
            $scope.bleStatus = 3;
            BleService.connect(device.id, function () {
                $scope.bleStatus = 5;
                $ionicPopup.alert({
                    title: '提示',
                    template: '请站上秤开始健康之旅！'
                });
                // 1、同步时钟
                BleService.confirmTime();
                // 2、设置个人信息
                BleService.setupParameter($scope.data.accountId, parseInt($scope.data.gender), $scope.data.age, parseInt($scope.data.height));
                // 3、设置单位
                BleService.configWeighingMode(Conf.DEFAULT_UNIT, Conf.DEFAULT_MODE);
            }, failure);
            BleService.startNotification($scope.receiveData);
        };
        $scope.receiveData = function (data) {
            if (data.head == Conf.LOCK_HEAD) {
                var _weight = parseInt(data.LockWeight, 16) / 10;
                if ($scope.phyIdx.weight != _weight) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '成功获取身体信息，请下秤！'
                    });
                    $scope.phyIdx.weight = parseInt(data.LockWeight, 16) / 10;
                    $scope.phyIdx.bmi = PhyIndexService.calcBMI($scope.phyIdx, $scope.data);
                    $scope.phyIdx.fatRatio = PhyIndexService.calcFatRatio($scope.phyIdx, $scope.data);

                    $scope.phyIdx = PhyIndexService.calcPhyIdx($scope.phyIdx, $scope.data);
                    PhyIndexService.set($scope.data.accountId, $scope.phyIdx);

                    //StorageHelper.setObject('userData', $scope.data);
                    $scope.data.score = $scope.phyIdx.score;
                    $scope.data.scoreRatio = $scope.phyIdx.scoreRatio;

                    PhyIndexService.submit($scope.phyIdx, $scope.data).success(function (response) {
                        if ($scope.waitToScale)
                            $scope.waitToScale = false;
                        if (response.success) {
                            //$scope.data.scoreRatio = response.data.scoreRatio;
                            $scope.calcScoreRank();

                            StorageHelper.setObject('userData', $scope.data);
                        }
                    }).error(function () {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '网络不可用'
                        });
                    });
                }
            }
        };

        $scope.refreshPhy = function () {
            //$scope.phyIdx = PhyIndexService.calcPhyIdx($scope.phyIdx, $scope.data);

            if ($scope.phyIdx.score != $scope.data.score) {
                $scope.data.score = $scope.phyIdx.score;
            }
            $scope.calcScoreRank();
        };

        $scope.calcScoreRank = function () {
            if ($scope.data.score < 60) {
                $scope.phyIdx.scoreRank = 1;
            } else if ($scope.data.score < 80) {
                $scope.phyIdx.scoreRank = 2;
            } else {
                $scope.phyIdx.scoreRank = 3;
            }
        };

        $scope.connectFail = function () {
            $scope.bleStatus = 4;
        };
        $scope.bleStatus = 0;
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.bleData = null;
            if (BleManager.selectedBle) {
                $scope.selectedBle = BleManager.selectedBle;
                $scope.connect($scope.selectedBle, $scope.connectFail);
            }
            $scope.data = StorageHelper.getObject('userData');
            if (!$scope.data.accountName) {
                $state.go('accountEdit', {accountId: $scope.data.accountId});
                return;
            } else {
                $scope.data.age = AccountService.calAge($scope.data.birth);
            }

            var _phyIdx = PhyIndexService.get($scope.data.accountId);
            if (_phyIdx) {
                $scope.phyIdx = _phyIdx;
                $scope.refreshPhy();
                $scope.waitToScale = false;
            } else {
                $scope.phyIdx = {};
                $scope.waitToScale = true;
            }
        });
        $ionicPlatform.ready($scope.init);
    })

    .controller('bleListCtrl', function ($scope, $state, $ionicPlatform, $ionicLoading, $timeout, BleService, BleManager, Conf) {
        $scope.bleList = [];
        $scope.isBleSelected = function () {
            return $scope.selectedBle == undefined || $scope.selectedBle == null;
        };
        $scope.scanCallback = function (device) {
            var exist = false;
            for (var i = 0; i < $scope.bleList.length; i++) {
                if ($scope.bleList[i].id == device.id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                $scope.bleList.push(device);
            }
        };
        $scope.selectedChange = function (device) {
            $scope.selectedBle = device;
        };
        $scope.scan = function () {
            BleService.startScan(function (device) {
                $ionicLoading.hide();
                $scope.scanCallback(device);
            }, function () {
                $scope.scanEnd();
            });
            $timeout(function () {
                $scope.scanEnd();
            }, Conf.SCAN_TIMEOUT * 1000);
        };
        $scope.scanEnd = function () {
            $ionicLoading.hide();
            BleService.stopScan();
            if ($scope.bleList.length == 0) {
                $scope.show = true;
            }
        };
        $scope.ok = function () {
            BleManager.addBle($scope.selectedBle);
            $state.go('tab.check');
        };
        $ionicPlatform.ready(function () {
            $ionicLoading.show({
                template: '扫描中...'
            });
            $scope.scan();
        });
    })

    .controller('editCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $ionicLoading, StorageHelper, Conf, AccountService, PhyIndexService) {
        $scope.heightDic = Conf.heightDic;
        $scope.waistlineDic = Conf.hipAndWaistlineDic;
        $scope.hiplineDic = Conf.hipAndWaistlineDic;
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.data = StorageHelper.getObject('userData');
            if ($scope.data.birth) {
                $scope.data = StorageHelper.getObject('userData');
                $scope.data.birth = new Date($scope.data.birth);
            } else {
                $scope.data.height = 170;
                $scope.data.waistline = 80;
                $scope.data.hipline = 90;
                $scope.data.birth = new Date('1985-09-03');
            }
        });
        $scope.cancel = function () {
            $ionicHistory.goBack();
        };

        $scope.edit = function () {
            $scope.data.tel = $scope.tel;
            if ($scope.data.accountName == undefined || $scope.data.accountName == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '昵称不能为空！'
                });
                return;
            }
            if ($scope.data.birth == undefined || $scope.data.birth == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '生日不能为空！'
                });
                return;
            }
            if ($scope.data.gender == undefined || $scope.data.gender == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '性别不能为空！'
                });
                return;
            }
            if ($scope.data.height == undefined || $scope.data.height == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '身高不能为空！'
                });
                return;
            }
            if ($scope.data.waistline == undefined || $scope.data.waistline == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '腰围不能为空！'
                });
                return;
            }
            $ionicLoading.show({
                template: 'Loading...'
            });
            AccountService.edit($scope.data).success(function (data) {
                if (data.success) {
                    StorageHelper.setObject('userData', $scope.data);
                    var phyIdx = PhyIndexService.get($scope.data.accountId);
                    if (phyIdx) {
                        phyIdx = PhyIndexService.calcPhyIdx(phyIdx, $scope.data);

                        PhyIndexService.set($scope.data.accountId, phyIdx);
                    }
                    $ionicPopup.alert({
                        title: '提示',
                        template: '修改用户信息成功！'
                    }).then(function () {
                        $state.go("tab.check");
                    });
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '修改用户信息失败！'
                    });
                }
                $ionicLoading.hide();
            }).error(function () {
                $ionicPopup.alert({
                    title: '提示',
                    template: '网络不可用！'
                });
                $ionicLoading.hide();
            });
        };
        $scope.logout = function () {
            $ionicPopup.confirm({
                title: '提示',
                template: '是否确定退出？'
            }).then(function (yes) {
                if (yes) {
                    StorageHelper.clear();

                    $state.go("login");
                }
            });
        }
    })

    .controller('accountCtrl', function ($scope, $state, $ionicLoading, $ionicPopup, StorageHelper, AccountService, PhyIndexService) {
        $scope.defaultAccount = StorageHelper.getObject('userData');
        $scope.data = {
            showDelete: false
        };
        $scope.addNewAccount = function () {
            $state.go('accountEdit');
        };
        $scope.refresh = function () {
            /*$scope.data.accountList = StorageHelper.getObject('accountList');
             if ($scope.data.accountList.length) {
             return;
             }*/
            $ionicLoading.show({
                template: 'Loading...'
            });
            AccountService.getAccountList().success(function (response) {
                $ionicLoading.hide();
                if (response.success) {
                    StorageHelper.setObject('accountList', response.data);
                    $scope.data.accountList = response.data
                }
                $scope.initAccount();
            }).error(function () {
                $ionicLoading.hide();
                $scope.initAccount();
            });
        };
        $scope.initAccount = function () {
            $scope.data.accountList = StorageHelper.getObject('accountList');
            for (var i = 0; i < $scope.data.accountList.length; i++) {
                if ($scope.data.accountList[i].accountId == $scope.defaultAccount.accountId) {
                    $scope.data.accountList[i].isDefault = true;
                }
            }
        };
        $scope.editAccount = function (account) {
            $state.go('accountEdit', {accountId: account.accountId});
        };
        $scope.setDefault = function (account) {
            account.age = AccountService.calAge(account.birth);
            for (var i = 0; i < $scope.data.accountList.length; i++) {
                if ($scope.data.accountList[i].accountId == account.accountId) {
                    $scope.data.accountList[i].isDefault = true;
                } else {
                    $scope.data.accountList[i].isDefault = false;
                }
            }
            var phyIdx = PhyIndexService.get(account.accountId);
            if (!phyIdx) {
                $ionicLoading.show({
                    template: 'Loading...'
                });
                PhyIndexService.query(account.accountId).success(function (response) {
                    $ionicLoading.hide();
                    if (response && response.success) {
                        if (response.data) {
                            phyIdx = PhyIndexService.calcPhyIdx(response.data, account);
                            account.scoreRatio = phyIdx.scoreRatio;

                            PhyIndexService.set(phyIdx.accountId, phyIdx);
                        }
                        StorageHelper.setObject('userData', account);
                        $scope.defaultAccount = account;

                        $state.go('tab.check');
                    }
                }).error(function (error) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: '提示',
                        template: JSON.stringify(error)
                    });
                });
            } else {
                phyIdx = PhyIndexService.calcPhyIdx(phyIdx, account);

                PhyIndexService.set(phyIdx.accountId, phyIdx);
                account.scoreRatio = phyIdx.scoreRatio;
                StorageHelper.setObject('userData', account);
                $scope.defaultAccount = account;

                $state.go('tab.check');
            }
        };
        $scope.deleteAccount = function (account) {
            var parentAccountId = StorageHelper.get('parentAccountId');
            if (account.accountId == parentAccountId) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '不能删除主账号！'
                });
                return;
            }
            $ionicLoading.show({
                template: 'Loading...'
            });
            AccountService.deleteAccount(account).success(function (response) {
                $ionicLoading.hide();
                if (response.success) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '删除用户信息成功！'
                    });

                    if (account.accountId == $scope.defaultAccount.accountId) {
                        $scope.setDefault(AccountService.getAccount(parentAccountId));
                    }
                    $scope.refresh();
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '删除用户信息失败！'
                    });
                }
            }).error(function () {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: '网络不可用！'
                });
            });
        };
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.refresh();
        });
    })

    .controller('accountEditCtrl', function ($scope, $filter, $state, $stateParams, $ionicHistory, $ionicLoading, $ionicPopup, Conf, StorageHelper, AccountService) {
        $scope.heightDic = Conf.heightDic;
        $scope.waistlineDic = Conf.hipAndWaistlineDic;
        $scope.hiplineDic = Conf.hipAndWaistlineDic;
        if ($stateParams.accountId) {
            $scope.data = AccountService.getAccount($stateParams.accountId);
            $scope.data.birth = new Date($scope.data.birth);
            $scope.title = '编辑账号信息';
        } else {
            $scope.title = '添加账号信息';
            $scope.data = {};
        }
        if (!$scope.data.height) {
            $scope.data.height = 170;
            $scope.data.waistline = 80;
            $scope.data.hipline = 90;
            $scope.data.birth = new Date('1985-09-03');
        }
        $scope.cancel = function () {
            $ionicHistory.goBack();
        };
        $scope.submit = function () {
            if ($scope.data.accountName == undefined || $scope.data.accountName == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '昵称不能为空！'
                });
                return;
            }
            if ($scope.data.gender == undefined || $scope.data.gender == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '性别不能为空！'
                });
                return;
            }
            if ($scope.data.birth == undefined || $scope.data.birth == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '生日不能为空！'
                });
                return;
            }
            if ($scope.data.height == undefined || $scope.data.height == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '身高不能为空！'
                });
                return;
            }
            if ($scope.data.waistline == undefined || $scope.data.waistline == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '腰围不能为空！'
                });
                return;
            }
            $ionicLoading.show({
                template: 'Loading...'
            });
            if ($stateParams.accountId) {
                AccountService.edit($scope.data).success(function (data) {
                    if (data.success) {
                        if ($scope.data.firstLogin) {
                            $scope.data.firstLogin = false;
                        }
                        var defaultAccount = StorageHelper.getObject('userData');
                        if ($scope.data.accountId == defaultAccount.accountId) {
                            StorageHelper.setObject('userData', $scope.data);
                        }
                        $ionicPopup.alert({
                            title: '提示',
                            template: '修改用户信息成功！'
                        }).then(function () {
                            $ionicHistory.goBack();
                        });
                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '修改用户信息失败！'
                        });
                    }
                    $ionicLoading.hide();
                }).error(function () {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '网络不可用！'
                    });
                    $ionicLoading.hide();
                });
            } else {
                $scope.data.parentAccountId = StorageHelper.get('parentAccountId');
                AccountService.addNewAccount($scope.data).success(function (data) {
                    if (data.success) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '添加用户信息成功！'
                        }).then(function () {
                            $ionicHistory.goBack();
                        });
                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '添加用户信息失败！'
                        });
                    }
                    $ionicLoading.hide();
                }).error(function () {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '网络不可用!'
                    });
                    $ionicLoading.hide();
                });
            }
        }
    })

    .controller('chartsCtrl', function ($scope, $ionicPopup, $ionicLoading, StorageHelper, PhyIndexService) {
        function _getMonthStartDate() {
            var date = new Date();
            return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
        }

        function _getMonthEndDate() {
            var date = new Date();
            return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0);
        }

        function _getQuarterStartDate() {
            var date = new Date();
            return new Date(date.getFullYear(), parseInt(date.getMonth() / 3) * 3, 1, 0, 0, 0);
        }

        function _getQuarterEndDate() {
            var date = _getQuarterStartDate();
            date.setMonth(date.getMonth() + 3);
            return date;
        }

        function _getYearStartDate() {
            var date = new Date();
            return new Date(date.getFullYear(), 0, 1, 0, 0, 0);
        }

        function _getYearEndDate() {
            var date = new Date();
            return new Date(date.getFullYear() + 1, 0, 1, 0, 0, 0);
        }

        $scope.queryHistory = function () {
            $ionicLoading.show({
                template: 'Loading...'
            });
            PhyIndexService.queryHistory($scope.accountId, $scope.startDate, $scope.endDate, $scope.mode).success(function (response) {
                $ionicLoading.hide();
                if (response.success) {
                    $scope.chartLabels = [];
                    $scope.weight = {chartData: [[]]};
                    $scope.bmi = {chartData: [[]]};
                    $scope.fatRatio = {chartData: [[]]};

                    var list = response.data || [];
                    for (var i = 0; i < list.length; i++) {
                        var idx = list[i];

                        if (idx.submitTime) {
                            if ($scope.mode == 'MONTH' || idx.submitTime == 1 || idx.submitTime%5 == 0) {
                                $scope.chartLabels[i] = idx.submitTime;
                            } else {
                                $scope.chartLabels[i] = '';
                            }
                            /*$scope.weight.chartData[0][i] = idx.weight.toFixed(1) || 0;
                             $scope.bmi.chartData[0][i] = idx.bmi.toFixed(1) || 0;
                             $scope.fatRatio.chartData[0][i] = idx.fatRatio.toFixed(1) || 0;*/
                            $scope.weight.chartData[0][i] = idx.weight ? idx.weight.toFixed(1) : 0;
                            $scope.bmi.chartData[0][i] = idx.bmi ? idx.bmi.toFixed(1) : 0;
                            $scope.fatRatio.chartData[0][i] = idx.fatRatio ? idx.fatRatio.toFixed(1) : 0;
                        }
                    }
                }
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'error',
                    template: JSON.stringify(error)
                });
                $ionicLoading.hide();
            })
        };

        $scope.changeType = function (type) {
            if ($scope.type != type) {
                $scope.classes = {};
                $scope.classes[type] = 'self_activated';
                $scope.type = type;

                if ($scope.type == 'month') {
                    $scope.mode = 'DAY';

                    $scope.startDate = _getMonthStartDate();
                    $scope.endDate = _getMonthEndDate();
                } else if ($scope.type == 'quarter') {
                    $scope.mode = 'MONTH';

                    $scope.startDate = _getQuarterStartDate();
                    $scope.endDate = _getQuarterEndDate();
                } else if ($scope.type == 'year') {
                    $scope.mode = 'MONTH';

                    $scope.startDate = _getYearStartDate();
                    $scope.endDate = _getYearEndDate();
                }

                $scope.queryHistory();
            }
        };

        $scope.swipe = function ($event) {
            /*$ionicPopup.alert({
             title: 'swipe',
             template: JSON.stringify($event)
             });*/
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            var defaultAccount = StorageHelper.getObject('userData');
            if (!$scope.accountId || $scope.accountId != defaultAccount.accountId) {
                $scope.chartLabels = [];
                $scope.weight = {chartData: [[]]};
                $scope.bmi = {chartData: [[]]};
                $scope.fatRatio = {chartData: [[]]};

                $scope.classes = {'month': 'self_activated'};
                $scope.type = 'month';
                $scope.mode = 'DAY';

                $scope.accountId = defaultAccount.accountId;
                $scope.startDate = _getMonthStartDate();
                $scope.endDate = _getMonthEndDate();

                $scope.queryHistory();
            }
        });
    })

    .controller('aboutCtrl', function ($scope, $state, $http, $ionicPopup) {

    })

    .controller('phyDetailCtrl', function ($scope, $ionicHistory, StorageHelper, PhyIndexService) {
        $scope.init = function() {
            $scope.showDes = {
                yesWeight: false,
                yesBmi: false,
                yesFatRatio: false,
                yesBmr: false,
                yesWater: false,
                yesSmr: false,
                yesBodyAge: false,
                yesBoneWeight: false,
                yesWhr: false,
                yesNoFatWeight: false,
                yesVfl: false,
                noWeight: false,
                noBmi: false,
                noFatRatio: false,
                noBmr: false,
                noWater: false,
                noSmr: false,
                noBodyAge: false,
                noBoneWeight: false,
                noWhr: false,
                noNoFatWeight: false,
                noVfl: false
            };
        };
        $scope.back = function () {
            $ionicHistory.goBack();
        };
        $scope.toggleDes = function (key) {
            var isShow = $scope.showDes[key];
            $scope.init();
            $scope.showDes[key] = !isShow;
        };
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.init();
            $scope.data = StorageHelper.getObject('userData');
            $scope.phyIdx = PhyIndexService.get($scope.data.accountId) || {};

            $scope.yesCount = 0;
            $scope.noCount = 0;
            if ($scope.phyIdx.weightRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.bmiRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.fatRatioRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.bmrRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.waterRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.smrRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.bodyAgeRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.boneWeightRank == 0) {
                $scope.yesCount += 1;
            }
            if ($scope.phyIdx.whrRank == 0) {
                $scope.yesCount += 1;
            }

            $scope.noCount = 9 - $scope.yesCount;
        });
    });
