//
//  SendDataToDevice.h
//  TijiyiClone
//
//  Created by ddd on 14-6-12.
//  Copyright (c) 2014年 twohe. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <UIKit/UIKit.h>


@protocol sendDelegate<NSObject>



@optional

-(void)getPeripheralsForScan:(CBPeripheral*)peripheral;
/*
 *获取蓝牙与设备的状态
 *@param State : 0(断开)，1（链接），2表示（链接成功需要ota升级）
 */
-(void)getBluetoothState:(int)State;
-(void)getBluetoothDataForScale:(NSDictionary*)dic;
-(void)getBluetoothData:(NSDictionary*)bluethoothDataDic;
/*
 *@discussion :ota升级返回当前包数跟总包数
 *@param indexPack:当前包
 *@param totalPack总包数
 */
-(void)recallOTApack:(int)indexPack :(int)totalPack;

@end

@interface SendDataToDevice : NSObject{
   
}
@property (strong, nonatomic) CBPeripheral *PeripheralInstance;

@property(nonatomic,weak)id<sendDelegate>delegate;

/*
 *@discussion :得到实例(单例模式)
 */
+(SendDataToDevice*)getSendDataToDeviceInstance;

-(void)myInit;

/*
 *@discussion :开始扫描设备
 */
-(void)starScanningDevice;
/*
 *@discussion :结束设备扫描一旦找到设备必须停止扫描
 */
-(void)stopScanningDevice;
//xju new begin

/*
 *@discussion :获取系统已经链接的设备，回调getBluetoothState，State为1 的时候可以行直接对蓝牙进行数据操作
 */
-(int)getConnectingDevice:(NSString*)uuid;
/*
 *@discussion :连接设备
 *@param peripheral:要链接的对象
 *@param timeout:超时的时间，0为默认时间15s
 */
-(void)connectDevice:(CBPeripheral*)peripheral timeout:(int)timeout;

/*
 *@discussion :断开设备
 */
-(void)disconnectDevice;


/*@discussion :显示进度条 view 当前界面
 *@param view :当前的view
 *@param text :要显示的文本
 */
-(void)showProgress :(UIView *)view :(NSString *)text;

/*
 *@discussion :取消进度条
 */
-(void)cancleProgress;



//手环协议
/*
 *@discussion :发送运动命令
 *返回结果:dic{
 *head (@"8111b5"),
 @"steps":(NSString),步数
 @"kilometer" :(NSString),公里数
 @"calories" :(NSString),卡路里
 @"sleepTime":(int)睡眠时间,单位分
 @"walkTime":(int)走路时间,单位分
 @"jogTime":(int)健步时间,单位分
 @"runTime":（int）跑步时间,单位分
 @"officeTime":（int）工作时间，单位分
 */
-(void)SendSportCommand;

/*
 *@discussion :发送睡眠命令
 *返回的结果 :dic{
 *head(@"8111b9"),
 @"sleepDataArray":(NSMutableArray),睡眠数据
 @"begin_hour":(int),开始时间小时
 @"iend_hour":(int),结束时间小时
 @"starPoint":(int),从第几个点开始
 @"isleepTime":(int),总的睡眠时间
 *}
 */
-(void)SendSleepCommand;
/*
 *@discussion :发送温度命令(没有温度ic的设备不支持此命令)
 *返回结果:dic{
 @"head":@"8111d1",
 @"symbol":(int), 0(+),1(-) ，温度正负
 @"TemperatureValueInt":（int）， 温度值
 }
 */
-(void)SendTemperatureCommand;

/*
 *@discussion :发送温湿度命令(没有温湿度ic的设备不支持此命令)
 *返回结果:dic{
 @"head":@"8111b6",
 @"symbol":(int), 0(+),1(-) ，温度正负
 @"temp":（int）， 温度值
 @"hum":（int）， 湿度值
 }
 */
-(void)SendHumitureCommand;

/*
 *@discussion :发送紫外线命令(没有紫外线ic的设备不支持此命令)
 返回结果:dic{
 @"head":@"8111bf",
 @"UltravioletValueStr":(NSString) uv的16进制值 当为ffff时候表示不支持紫外线
 @"uvProgress":（float）:uv的级数
 }
 */
-(void)SendUltravioletCommand;
/*
 *@discussion :发送时间命令
 *返回结果:dic{
 @"head":@"8111b7"
 }
 */
-(void)SendTimeCommand;
/*
 *@discussion :发送版本号电量命令
 *返回结果:dic{
 @"head":@"8111be",
 @"VersionDataStr":(NSString),固件版本号
 @"BatteryDataStr":(NSString),固件电池电量
 @"time":(NSString)固件当前时间

 */
-(void)SendVersionBatteryCommand;

/*
 *@discussion :发送个人信息命令
 *@param height:身高
 *@param weight:体重
 *@param targetCalories:目标卡路里
 *@param sex:性别
 *@param walkStride:走路步长
 *@param jogStride:健步步长
 *@param runStride:跑步步长
 *返回的结果 :dic{
 @"head":@"8111b2"
 }
 */
-(void)SendPersonalInformationCommand:(int)height :(int)weight :(int)targetCalories :(int)sex :(int)walkStride :(int)jogStride :(int)runStride;

/*
 *@discussion :获取前一天的睡眠命令
 *@param index:第几天，最大不能超过7
 *返回的结果 :dic{
 head(@"8111d3"),
 sleepDataArray(NSMutableArray),
 ibegin_hour(int),
 iend_hour(int),
 starPoint(int),
 isleepTime(int) 
 }
 */
-(void)SendYesterdaySleepCommand:(int)index;
/*
 *@discussion :获取前一天的运动命令
 *@param index:第几天，最大不能超过7
 *返回结果:dic{
 *head (@"8111d4"),
 @"steps":(NSString),步数
 @"kilometer" :(NSString),公里数
 @"calories" :(NSString),卡路里
 @"sleepTime":(int)睡眠时间,单位分
 @"walkTime":(int)走路时间,单位分
 @"jogTime":(int)健步时间,单位分
 @"runTime":（int）跑步时间,单位分
 @"officeTime":（int）工作时间，单位分
 */
-(void)SendYesterdaySportCommand:(int)index;
/*
 *@discussion :设备按键功能
 *返回的结果 :dic{
 
 @"head":@"8111b0"

 }
 */
-(void)SendSearchCommand;

/*
 *@discussion :修改设备名字(ios名字变化慢)
 */
//-(void)SendRenameDeviceCommand;
/*
 *@discussion :获取设备名字
 */
-(NSString*) getDeviceName;


/*
 *@discussion :请求健步，跑步，慢行步数
 *@param index:第几天，最大不能超过7
 *返回的结果 :dic{
 @"head":@"8111d8",
 @"Twalk":(NSString),当天走路步数
 @"Tjog":(NSString),当天健步步数
 @"Trun":(NSString),当天跑步步数
 }
 */
-(void)SendStepNumber:(int)index;

/*
 *@discussion :请求闹钟（不带马达的设备不支持）
 * @param Clock:{
 *Clock1:0表示关闭，1表示开启。
 *Clock2:0表示关闭，1表示开启。
 *Clock3:0表示关闭，1表示开启。
 *}
 *
 *@param Week{
 *clock1{
 *星期n:0表示关闭，1表示开启。
 *
 *}
 *
 *clock2{
 *星期n:0表示关闭，1表示开启。
 *
 *}
 *
 *
 *clock3{
 *星期n:0表示关闭，1表示开启。
 *
 *}
 *
 *
 *}
 *
 *@param hour{
 * clock1小时。
 * clock2小时。
 *clock3小时。
 *
 *
 *
 *}，
 *
 *@param min{
 *clock1分钟。
 *clock2分钟。
 *clock3分钟。
 *}
 
 返回的结果 :无
 */

-(void)SendClockCommand :(NSMutableArray*)Clock :(NSMutableArray*)Week :(NSMutableArray*)Hour :(NSMutableArray*)min;

/*
 *@discussion :让设备进入高速传输模式，电流会变大
 *返回的结果 :dic={
  @"head":@"8111d9"
 }
 */
-(void)HighSpeed;

/*
 *@discussion :让设备进入低速传输模式，电流会变小
 *返回的结果 :dic={
 @"head":@"8111d9"
 }
 */
-(void)LowSpeed;



/*
 *@discussion :设置提醒开关
 *@param notify 消息:1为开0位关，
 *@param callphone 来电:1为开，0为关
 *@param discon:断开提醒:1为开，0为关
 *返回的结果 :dic={
 @"head":@"8111f1",
 @"callSwitch" :(int),1(开)，0（关）来电开关
 @"notifySwitch" :(int),1(开)，0（关）通知开关
 @"dis" :(int)，1(开)，0（关）断开提醒开关
 */
-(void)SetSwitchState:(int)notify :(int)callphone :(int)discon;
/*
 *@discussion :请求设备开关的状态
 *返回的结果 :dic={
 @"head":@"8111f2",
 @"callSwitch" :(int),1(开)，0（关）来电开关
 @"notifySwitch" :(int),1(开)，0（关）通知开关
 @"dis" :(int)，1(开)，0（关）断开提醒开关
 */
-(void)GetSwitchState;
/*
 *@discussion :升级的时候需要强制转到a区,设备会重新启动，只能搜索到a的服务（升级的服务）
 *返回的结果:无
 */
-(void)OADcomeA;

/*
 *@discussion :获取设备里面的功能
 *@param deviceName:设备名字
 */
-(NSDictionary*)getDeviceFunction:(NSString *)deviceName;


/*
 *@discussion :请求某天每小时运动数据
 *@param day:第几天
 *@param packTotal:总包数默认为1
 *@param packIndex:第几个包，默认为1
 *返回结果:dic{
 head(@"e10303"),
 OneHourSportData(NSString) 每小时的运动数据
 
 }
 */
-(void) sendOneHourSport:(int)day :(int)packTotal :(int)packIndex;

/*
 *@discussion :链接状态
 */
-(BOOL)getDeviceState;
/*
 *@discussion :手机主动链接设备提醒
 *返回的结果:无
 */
-(void)setConnectShow;

/*
 *来电提醒
 *@param motor:1表示马达开启，0表示马达关闭
 */
-(void)SendCallPhoneCommand:(int)motor;
/*
 *电话挂断，未接，接听等操作
 */
-(void)SendMissCallPhoneCommand;

/*
 *用户手动杀掉app的时候跑这个函数来重连
 */
//-(void)RconnectForAppKillCommand :(NSString *)suuid;

/*
 *解除绑定
 */
-(void)removeBondCommand;

/*
 *@discussion :设置ota升级数据，内部使用
 *@param data:升级数据
 */
-(void)setOADFirmwareData:(NSData *)data;
/*
 *@discussion :开始ota配置
 */
-(void)startOADconfig;


/*
 *@discussion :带ancs
＊@param versinon:  当前的系统版本 如9.1.0
 */
-(void)openAncs:(NSString*)versinon;


/*
 *@discussion :心率 
＊@param ：mode:1表示开，0表示关
 */
-(void)SendHeartRate:(int)mode;


//noridc ota begin
/*
 *@discussion :nordic ota 配置内部使用
 ＊@param ：mode:1表示开，0表示关
 */
-(void)OTAConfig:(NSData*)data :(CBPeripheral*)peripheral :(id)myself;
-(void)beginOTA;

//nordic ota end


/*
 *@discussion :写入数据
 *@param ：data: 要写入的数据
 */
-(void)writeToDevice:(NSData*)data;

//xju new end




//电子秤 协议
/*
 *电子秤通过时间查询被0x72因为时间不同步删掉的的数据
 */
//-(void)ElectronicScalesInquireTime:(NSString*)time;
/*
 *电子秤同步时间
 *返回结果:dic｛head（72），result｝
 */
-(void)ElectronicScalesConfirmTime;

/*
 *电子秤得到所有记录
 */
//-(void)ElectronicScalesGetAllRecord;
/*
 *停止获取所有记录
 */
//-(void)ElectronicScalesStopGetAllRecord;
/*
 *获取固件版本
 *返回结果:dic｛head（75），versionH，versionL｝
 */
-(void)ElectronicScalesGetFirmwareVersion;
/*
 *获取当前模块时间
 */
//-(void)ElectronicScalesGetModuleCurrentTime;

/*
 *根据体重范围来删除记录 weight1,weight2:体重，scope1，scope2误差范围
 */
//-(void)ElectronicScalesDeleteRecordByWeight:(int)weight1 :( int)weight2 :( int)scope1 :( int)scope2;
    
/*
 *根据时间范围来删除记录 minTime ：开始时间，maxTime：结束时间
 */
//-(void)ElectronicScalesDeleteRecordByTime:(NSString*) minTime :(NSString *)maxTime;

/*
 *写入序列号长度最大为8
 *@param number :序列号
 *返回结果:dic｛head（79），NSLen，SN｝
 */
-(void)ElectronicScalesWriteSerialNumber:(NSString*) number;

/*
 *读序列号
 *返回结果:dic｛head（80），sSN｝
 */
-(void)ElectronicScalesReadSerialNumber;

/*
 *设置设备名长度最大为19
 *@param deviceName:设备名
 *返回结果:dic｛head（81）,result｝
 */
-(void)ElectronicScalesSetModuleName:(NSString*) deviceName;

 /*
  *配置电子秤的的计量单位和模式
  *@param unit:单位，1 kg, 2 lb,3 ST
  *@param mode:0 称重模式,1校准模式
  *返回结果:dic｛head（82）,result｝
  */
-(void)ElectronicScalesConfigWeighingMode:(int )unit :(int) mode;
/*
 *配置用户参数，
 *@param id:用户号
 *@param age:年龄
 *@param height:身高
 *返回结果:dic｛head（83）,result｝
 */
-(void)ElectronicScalesSetupParameter:(int) id :(int)sex :(int) age :(int) height;




//获取卡路里 ： sex：性别,height:身高 ,weight:体重,age年龄,run:跑步,walk:走路
-(int)getCalorie:(bool)sex height:(int)height weight:(int)weight age:(int)age run:(int)run walk:(int)walk;

@end
