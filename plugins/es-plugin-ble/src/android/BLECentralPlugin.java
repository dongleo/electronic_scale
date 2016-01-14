// (c) 2104 Don Coleman
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

package com.megster.cordova.ble.central;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;
import com.xrz.lib.bluetooth.BTLinkerUtils;
import com.xrz.lib.bluetooth.BtlinkerDataListener;
import com.xrz.lib.bluetooth.ReceiveDeviceDataService;
import org.apache.cordova.*;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

public class BLECentralPlugin extends CordovaPlugin implements BluetoothAdapter.LeScanCallback, BtlinkerDataListener {

    // actions
    private static final String START_SCAN = "startScan";
    private static final String STOP_SCAN = "stopScan";

    private static final String CONNECT = "connect";
    private static final String DISCONNECT = "disconnect";

    private static final String START_NOTIFICATION = "startNotification"; // register for characteristic notification
    private static final String STOP_NOTIFICATION = "stopNotification"; // remove characteristic notification

    private static final String CONFIRM_TIME = "confirmTime";
    private static final String CONFIG_WEIGHING_MODE = "configWeighingMode";
    private static final String SETUP_PARAMETER = "setupParameter";
    // callbacks
    private CallbackContext discoverCallback;
    private CallbackContext connectCallback;
    private CallbackContext notificationCallback;

    private static final String TAG = "BLEPlugin";
//    private static final int REQUEST_ENABLE_BLUETOOTH = 1;

    BluetoothAdapter bluetoothAdapter;

    // key is the MAC Address
    Map<String, Peripheral> peripherals = new LinkedHashMap<String, Peripheral>();

    @Override
    protected void pluginInitialize() {
        super.pluginInitialize();

        // 初始化蓝牙SDK
        Activity activity = cordova.getActivity();
        Intent dataIntent = new Intent(activity, ReceiveDeviceDataService.class);
        activity.startService(dataIntent);
    }

    @Override
    public boolean execute(final String action, final CordovaArgs args, final CallbackContext callbackContext) {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                LOG.i(TAG, "action = " + action);

                if (bluetoothAdapter == null) {
                    Activity activity = cordova.getActivity();
                    BluetoothManager bluetoothManager = (BluetoothManager) activity.getSystemService(Context.BLUETOOTH_SERVICE);
                    bluetoothAdapter = bluetoothManager.getAdapter();
                }

                try {
                    if (action.equals(START_SCAN)) {
                        startScan(callbackContext);
                    } else if (action.equals(STOP_SCAN)) {
                        stopScan(callbackContext);
                    } else if (action.equals(CONNECT)) {
                        String macAddress = args.getString(0);
                        connect(callbackContext, macAddress);
                    } else if (action.equals(DISCONNECT)) {
                        disconnect(callbackContext);
                    } else if (action.equals(START_NOTIFICATION)) {
                        startNotification(callbackContext);
                    } else if (action.equals(STOP_NOTIFICATION)) {
                        stopNotification(callbackContext);
                    } else if (action.equals(CONFIRM_TIME)) {
                        confirmTime(callbackContext);
                    } else if (action.equals(CONFIG_WEIGHING_MODE)) {
                        int unit = args.getInt(0);
                        int mode = args.getInt(1);
                        configWeighingMode(callbackContext, unit, mode);
                    } else if (action.equals(SETUP_PARAMETER)) {
                        int accountId = args.getInt(0);
                        int sex = args.getInt(1);
                        int age = args.getInt(2);
                        int height = args.getInt(3);
                        setupParameter(callbackContext, accountId, sex, age, height);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        return true;
    }

    private void startScan(CallbackContext callbackContext) {
        // clear non-connected cached peripherals
        for (Iterator<Map.Entry<String, Peripheral>> iterator = peripherals.entrySet().iterator(); iterator.hasNext(); ) {
            Map.Entry<String, Peripheral> entry = iterator.next();
            iterator.remove();
        }

        discoverCallback = callbackContext;

        bluetoothAdapter.startLeScan(this);

        /*PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
        result.setKeepCallback(true);
        callbackContext.sendPluginResult(result);*/
    }

    private void stopScan(CallbackContext callbackContext) {
        bluetoothAdapter.stopLeScan(this);
        callbackContext.success();
    }

    private void connect(CallbackContext callbackContext, String macAddress) {
        //todo
        Peripheral peripheral = peripherals.get(macAddress);
        if (peripheral != null) {
            connectCallback = callbackContext;

            ReceiveDeviceDataService.isrunconnect = true;
            ReceiveDeviceDataService.setBtlinkerDataListener(this);
            BTLinkerUtils.connect(macAddress);
        } else {
            callbackContext.error("Peripheral " + macAddress + " not found.");
        }
    }

    private void disconnect(CallbackContext callbackContext) {
        BTLinkerUtils.disconnect();
        callbackContext.success();
    }

    private void startNotification(CallbackContext callbackContext) {
        notificationCallback = callbackContext;
    }

    private void stopNotification(CallbackContext callbackContext) {
        notificationCallback = null;
        callbackContext.success();
    }

    private void confirmTime(CallbackContext callbackContext) {
        ReceiveDeviceDataService.sendElectronicScalesConfirmTime();
    }

    private void configWeighingMode(CallbackContext callbackContext, int unit, int mode) {
        ReceiveDeviceDataService.sendElectronicScalesConfigWeighingMode(unit, mode);
    }

    private void setupParameter(CallbackContext callbackContext, int accountId, int sex, int age, int height) {
        ReceiveDeviceDataService.sendElectronicScalesSetupParameter(accountId, sex, age, height);
    }

    @Override
    public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {

        String address = device.getAddress();

        if (!peripherals.containsKey(address)) {

            Peripheral peripheral = new Peripheral(device, rssi, scanRecord);
            peripherals.put(device.getAddress(), peripheral);

            if (discoverCallback != null) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, peripheral.asJSONObject());
                result.setKeepCallback(true);
                discoverCallback.sendPluginResult(result);
            }

//        } else {
//            // this isn't necessary
//            Peripheral peripheral = peripherals.get(address);
//            peripheral.updateRssi(rssi);
        }

        // TODO offer option to return duplicates

    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {

        /*if (requestCode == REQUEST_ENABLE_BLUETOOTH) {

            if (resultCode == Activity.RESULT_OK) {
                LOG.d(TAG, "User enabled Bluetooth");
                if (enableBluetoothCallback != null) {
                    enableBluetoothCallback.success();
                }
            } else {
                LOG.d(TAG, "User did *NOT* enable Bluetooth");
                if (enableBluetoothCallback != null) {
                    enableBluetoothCallback.error("User did not enable Bluetooth");
                }
            }

            enableBluetoothCallback = null;
        }*/
    }

    @Override
    public void getMusicbr(String s) {

    }

    @Override
    public void getBluetoothData(Map<String, String> map) {
        LOG.i(TAG, "receive data = " + map);
        if (notificationCallback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, new JSONObject(map));
            result.setKeepCallback(true);
            notificationCallback.sendPluginResult(result);
        }
    }

    @Override
    public void getBluetoothConnectState(boolean b) {
        LOG.i(TAG, "getBluetoothConnectState = " + b);
        if ( b && connectCallback != null) {
            connectCallback.success();
//            ReceiveDeviceDataService.sendElectronicScalesConfirmTime();
//            ReceiveDeviceDataService.sendElectronicScalesConfigWeighingMode(0, 1);
//            setupParameter(null, 1, 1, 21, 177);
        }
    }

    @Override
    public void getBluetoothRSSI(int i) {
        LOG.i(TAG, "getBluetoothRSSI = " + i);
    }

    @Override
    public void getBluetoothWriteState(boolean b) {
        LOG.i(TAG, "getBluetoothWriteState = " + b);
    }
}
