// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global cordova, module */
"use strict";

var stringToArrayBuffer = function(str) {
    var ret = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        ret[i] = str.charCodeAt(i);
    }
    // TODO would it be better to return Uint8Array?
    return ret.buffer;
};

var base64ToArrayBuffer = function(b64) {
    return stringToArrayBuffer(atob(b64));
};

function massageMessageNativeToJs(message) {
    if (message.CDVType == 'ArrayBuffer') {
        message = base64ToArrayBuffer(message.data);
    }
    return message;
}

// Cordova 3.6 doesn't unwrap ArrayBuffers in nested data structures
// https://github.com/apache/cordova-js/blob/94291706945c42fd47fa632ed30f5eb811080e95/src/ios/exec.js#L107-L122
function convertToNativeJS(object) {
    Object.keys(object).forEach(function (key) {
        var value = object[key];
        object[key] = massageMessageNativeToJs(value);
        if (typeof(value) === 'object') {
            convertToNativeJS(value);
        }
    });
}

module.exports = {
    startScan: function (success, failure) {
        var successWrapper = function(peripheral) {
            convertToNativeJS(peripheral);
            success(peripheral);
        };
        cordova.exec(successWrapper, failure, 'BLE', 'startScan', [services]);
    },

    stopScan: function (success, failure) {
        cordova.exec(success, failure, 'BLE', 'stopScan', []);
    },

    connect: function (device_id, success, failure) {
        cordova.exec(success, failure, 'BLE', 'connect', [device_id]);
    },

    disconnect: function (device_id, success, failure) {
        cordova.exec(success, failure, 'BLE', 'disconnect', [device_id]);
    },

    // success callback is called on notification
    startNotification: function (success, failure) {
        cordova.exec(success, failure, 'BLE', 'startNotification', []);
    },

    // success callback is called when the descriptor 0x2902 is written
    stopNotification: function (success, failure) {
        cordova.exec(success, failure, 'BLE', 'stopNotification', []);
    },

    confirmTime: function (success, failure) {
        cordova.exec(success, failure, 'BLE', 'confirmTime', []);
    },

    configWeighingMode: function (unit, mode, success, failure) {
        cordova.exec(success, failure, 'BLE', 'configWeighingMode', [unit, mode]);
    },

    setupParameter: function (id, sex, age, height, success, failure) {
        cordova.exec(success, failure, 'BLE', 'setupParameter', [id, sex, age, height]);
    }

};
