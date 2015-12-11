var controllers = angular.module('app.controllers', []);

controllers.value('Conf', {
    'heightDic': [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
    'waistlineDic': [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180],
    'SERVICE_UUID': 'FFF0',
    'CHARACTERISTIC_UUID': 'FFF6',
    'LOCKED_FLAT': -47
});

controllers.controller('loginCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, StorageHelper, AccountService) {
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
                    StorageHelper.set('hasLogin', true);
                    StorageHelper.setObject('userData', response.data);
                    $ionicLoading.hide();
                    $state.go("index");
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
                    template: '登录失败！'
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
                        template: '注册失败！'
                    });
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('checkCtrl', function ($scope, $ionicPlatform, $state, $ionicPopup, $cordovaBLE, PhyIndexService, StorageHelper, BleManager, Conf) {
        $scope.data = {
            weight: StorageHelper.get('weight')
        };

        $scope.goToEdit = function () {
            $state.go('edit');
        };
        $scope.addBle = function () {
            $state.go('tab.blelist');
        };
        $scope.init = function () {
            $scope.bleList = BleManager.getBleList();
            $scope.selectedBle = BleManager.selectedBle;
            $ionicPopup.alert({
                title: 'init',
                template: JSON.stringify($scope.bleList)
            });
            if ($scope.selectedBle) {
                $scope.connect($scope.selectedBle, $scope.connectFail);
            } else {
                $scope.scan();
            }
        };
        $scope.scan = function() {
            //$cordovaBLE.scan([], 10).then(function (device) {
            ble.scan([], 10, function (device) {
                $ionicPopup.alert({
                    title: 'scan',
                    template: 'scan'
                });
                if (BleManager.exist(device)) {
                    $scope.connect(device, $scope.connectFail);
                }
            }, function() {});
        };
        $scope.connect = function (ble, failure) {
            $cordovaBLE.connect(ble.id).then(function () {
                $cordovaBLE.startNotification(ble.id, Conf.SERVICE_UUID, Conf.CHARACTERISTIC_UUID)
                    .then($scope.receiveData);
            }, failure);
        };
        $scope.receiveData = function (data) {
            $scope.bleData = data;
            $scope.data.weight = (parseInt(data[3]) << 8) | parseInt(data[4]);
            $scope.data.weight /= 10;

            $ionicPopup.alert({
                title: '收到信息',
                template: '体重：' + $scope.data.weight
            });

            StorageHelper.set('weight', $scope.data.weight);

            var account = StorageHelper.getObject('userData');
            PhyIndexService.submit({accountId: account.accountId, weight: $scope.data.weight})
        };
        $scope.connectFail = function() {};
        $scope.refreshData = function () {
            //TODO 动画效果
        };
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.selectedBle = BleManager.selectedBle;
            if ($scope.selectedBle) {
                $scope.connect($scope.selectedBle, $scope.connectFail);
            }
        });
        $ionicPlatform.ready($scope.init);
    })

    .controller('bleListCtrl', function ($scope, $state, $ionicPlatform, $ionicLoading, $ionicPopup, $cordovaBLE, BleManager) {
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
        $scope.selectedChange = function (ble) {
            $scope.selectedBle = ble;
        };
        $scope.scan = function () {
            //TODO $cordovaBLE收不到回调
            //$cordovaBLE.scan([], 10).then(function (device) {
            ble.scan([], 10, function (device) {
                $ionicLoading.hide();
                $scope.scanCallback(device);
            }, function () {
                $ionicLoading.hide();
            });
        };
        $scope.ok = function () {
            BleManager.addBle($scope.selectedBle);
            $state.go('tab.check');
        };
        $ionicPlatform.ready(function () {
            $ionicLoading.show({
                template: '扫描中...'
            });
            $cordovaBLE.isEnabled().then(function () {
                $scope.scan();
            }, function () {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: '蓝牙不可用！'
                });
            });
        });
    })

    .controller('editCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, StorageHelper, Conf, AccountService) {
        $scope.heightDic = Conf.heightDic;
        $scope.waistlineDic = Conf.waistlineDic;
        $scope.data = StorageHelper.getObject('userData');
        $scope.tel = parseInt($scope.data.tel);

        $scope.edit = function () {
            $scope.data.tel = $scope.tel;
            //$scope.data.birth = $scope.birth;

            if ($scope.data.tel == undefined || $scope.data.tel == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '手机号不能为空！'
                });
            } else if ($scope.data.accountName == undefined || $scope.data.accountName == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '昵称不能为空！'
                });
                /*} else if ($scope.data.birth == undefined || $scope.data.birth == '') {
                 $ionicPopup.alert({
                 title: '提示',
                 template: '生日不能为空！'
                 });*/
            } else if ($scope.data.gender == undefined || $scope.data.gender == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '性别不能为空！'
                });
            } else if ($scope.data.height == undefined || $scope.data.height == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '身高不能为空！'
                });
            } else if ($scope.data.gender == undefined || $scope.data.gender == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '腰围不能为空！'
                });
            } else {
                $ionicLoading.show({
                    template: 'Loading...'
                });
                AccountService.edit($scope.data).success(function (data) {
                    if (data.success) {
                        StorageHelper.setObject('userData', $scope.data);
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
                        template: '修改用户信息失败！'
                    });
                    $ionicLoading.hide();
                });
            }
        };
        $scope.logout = function () {
            $ionicPopup.confirm({
                title: '提示',
                template: '是否确定退出？'
            }).then(function (yes) {
                if (yes) {
                    StorageHelper.remove('userData');
                    StorageHelper.remove('hasLogin');

                    $state.go("login");
                }
            });
        }
    });
