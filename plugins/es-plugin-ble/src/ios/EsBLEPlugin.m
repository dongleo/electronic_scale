//
//  EsBLEPlugin.h
//  BLE Central Cordova Plugin
//
//  (c) 2105-2016 Liu Dong
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

#import "EsBLEPlugin.h"
#import <Cordova/CDV.h>

@interface EsBLEPlugin()
- (CBPeripheral *)findPeripheralByUUID:(NSString *)uuid;
- (NSArray *)marshall:(NSData *)data;
@end

@implementation EsBLEPlugin

@synthesize peripherals;

- (void)pluginInitialize {
    NSLog(@"Electronic Sacle BLE Central Plugin");
    NSLog(@"(c)2015-2016 Liu Dong");

    [super pluginInitialize];

    peripherals = [NSMutableSet set];
    
    bleHandler = [SendDataToDevice getSendDataToDeviceInstance];
    bleHandler.delegate = self;
}

#pragma mark - Electronic Scale BLE Plugin Methods

- (void)startScan:(CDVInvokedUrlCommand*)command {
    NSLog(@"startScan");
    discoverPeripherialCallbackId = [command.callbackId copy];
    
    [bleHandler starScanningDevice];
}

- (void)stopScan:(CDVInvokedUrlCommand*)command {
    NSLog(@"stopScan");
    
    [bleHandler stopScanningDevice];
    
    if (discoverPeripherialCallbackId) {
        discoverPeripherialCallbackId = nil;
    }
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

// connect: function (device_id, success, failure) {
- (void)connect:(CDVInvokedUrlCommand *)command {
    NSLog(@"connect");
    connectCallbackId = [command.callbackId copy];
    NSString *uuid = [command.arguments objectAtIndex:0];

    CBPeripheral *peripheral = [self findPeripheralByUUID:uuid];
    
    BOOL success = NO;

    if (peripheral) {
        NSLog(@"Connecting to peripheral with UUID : %@", uuid);

        @try {
            [bleHandler connectDevice:peripheral timeout:15];
            success = YES;
        } @catch(NSException *e) {
            NSLog(@"Connecting fail.");
        }
    }
    
//    CDVPluginResult *pluginResult = nil;
//    if (success) {
//        NSLog(@"connect success.");
//        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
//    } else {
//        NSString *error = [NSString stringWithFormat:@"Could not find peripheral %@.", uuid];
//        NSLog(@"%@", error);
//        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
//    }
//    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

// disconnect: function (device_id, success, failure) {
- (void)disconnect:(CDVInvokedUrlCommand*)command {
    NSLog(@"disconnect");

    NSString *uuid = [command.arguments objectAtIndex:0];
    CBPeripheral *peripheral = [self findPeripheralByUUID:uuid];

//    connectCallbackId = nil;

    if (peripheral && peripheral.state != CBPeripheralStateDisconnected) {
        [bleHandler disconnectDevice];
    }

    // always return OK
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

// success callback is called on notification
// notify: function (success, failure) {
- (void)startNotification:(CDVInvokedUrlCommand*)command {
    NSLog(@"registering for notification");
    
    notificationCallbackId = [command.callbackId copy];
}

// stopNotification: function (success, failure) {
- (void)stopNotification:(CDVInvokedUrlCommand*)command {
    NSLog(@"stop notification");
    notificationCallbackId = nil;
}

// hardwareVersion {
- (void)hardwareVersion:(CDVInvokedUrlCommand *)command {
    NSLog(@"hardwareVersion");
}

// confirmTime {
- (void)confirmTime:(CDVInvokedUrlCommand *)command {
    NSLog(@"confirmTime");
    
    [bleHandler ElectronicScalesConfirmTime];
}

// configWeighingMode: function (unit, mode, success, failure) {
- (void)configWeighingMode:(CDVInvokedUrlCommand*)command {
    NSLog(@"configWeighingMode");
    
    NSString *unit = [command.arguments objectAtIndex:0];
    NSString *mode = [command.arguments objectAtIndex:1];
    
    [bleHandler ElectronicScalesConfigWeighingMode:[unit intValue] :[mode intValue]];
}

// setupParameter: function (user_id, age, height, success, failure) {
- (void)setupParameter:(CDVInvokedUrlCommand*)command {
    NSLog(@"setupParameter");
    
    NSString *accountId = [command.arguments objectAtIndex:0];
    NSString *sex = [command.arguments objectAtIndex:1];
    NSString *age = [command.arguments objectAtIndex:2];
    NSString *height = [command.arguments objectAtIndex:3];
    
    [bleHandler ElectronicScalesSetupParameter:[accountId intValue]
                                              :[sex intValue]
                                              :[age intValue]
                                              :[height intValue]];
}

#pragma mark - sendDelegate

-(void)getPeripheralsForScan:(CBPeripheral *)peripheral{
    NSLog(@"getPeripheralsForScan: %@", [peripheral asDictionary]);
    [peripherals addObject:peripheral];
    
    if (discoverPeripherialCallbackId) {
        CDVPluginResult *pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[peripheral asDictionary]];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:discoverPeripherialCallbackId];
    }
}

-(void)getBluetoothState:(BOOL)State{
    NSLog(@"getBluetoothState: %d", State);
    if (connectCallbackId) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:connectCallbackId];
    }
}

-(void)getBluetoothDataForScale:(NSDictionary*)dic {
    NSLog(@"getBluetoothDataForScale: %@", dic);
    if (notificationCallbackId) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dic];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:notificationCallbackId];
    }
}

-(void)getBluetoothData:(NSString*)bluethoothData {
    NSLog(@"getBluetoothData: %@", bluethoothData);
}

#pragma mark - internal implemetation

- (CBPeripheral*)findPeripheralByUUID:(NSString*)uuid {
    CBPeripheral *peripheral = nil;

    for (CBPeripheral *p in peripherals) {
        NSString* other = p.identifier.UUIDString;

        if ([uuid isEqualToString: other]) {
            peripheral = p;
            break;
        }
    }
    return peripheral;
}

// RedBearLab
-(CBService *) findServiceFromUUID:(CBUUID *)UUID p:(CBPeripheral *)p
{
    for(int i = 0; i < p.services.count; i++)
    {
        CBService *s = [p.services objectAtIndex:i];
        if ([self compareCBUUID:s.UUID UUID2:UUID])
            return s;
    }

    return nil; //Service not found on this peripheral
}

// Find a characteristic in service with a specific property
-(CBCharacteristic *) findCharacteristicFromUUID:(CBUUID *)UUID service:(CBService*)service prop:(CBCharacteristicProperties)prop
{
    NSLog(@"Looking for %@ with properties %lu", UUID, (unsigned long)prop);
    for(int i=0; i < service.characteristics.count; i++)
    {
        CBCharacteristic *c = [service.characteristics objectAtIndex:i];
        if ((c.properties & prop) != 0x0 && [c.UUID.UUIDString isEqualToString: UUID.UUIDString]) {
            return c;
        }
    }
   return nil; //Characteristic with prop not found on this service
}

// Find a characteristic in service by UUID
-(CBCharacteristic *) findCharacteristicFromUUID:(CBUUID *)UUID service:(CBService*)service
{
    NSLog(@"Looking for %@", UUID);
    for(int i=0; i < service.characteristics.count; i++)
    {
        CBCharacteristic *c = [service.characteristics objectAtIndex:i];
        if ([c.UUID.UUIDString isEqualToString: UUID.UUIDString]) {
            return c;
        }
    }
   return nil; //Characteristic not found on this service
}

// RedBearLab
-(int) compareCBUUID:(CBUUID *) UUID1 UUID2:(CBUUID *)UUID2
{
    char b1[16];
    char b2[16];
    [UUID1.data getBytes:b1];
    [UUID2.data getBytes:b2];

    if (memcmp(b1, b2, UUID1.data.length) == 0)
        return 1;
    else
        return 0;
}

- (NSArray *)marshall: (NSData *) data
{
    NSMutableArray *result = [[NSMutableArray alloc] initWithCapacity:data.length];
    char* bu= (char *)[data bytes];
    for (int i=0; i<[data length];i++){
        //        NSLog(@"打印数据：%d", (int)bu[i]);
        [result addObject:[NSNumber numberWithChar:bu[i]]];
    }
    return result;
}

@end
