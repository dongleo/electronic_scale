//
//  AnalysisBluetoothData.h
//  TijiyiClone
//
//  Created by apple on 14-8-27.
//  Copyright (c) 2014年 twohe. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface AnalysisBluetoothData : NSObject

+(AnalysisBluetoothData*)getAnalysisBluetoothDataInstance;

-(NSDictionary*)AnalysisSleepData:(NSString*)sleepData;

-(NSDictionary*)AnalysisYesterdaySleepData:(NSString*)sleepData;

-(NSDictionary*)AnalysisSportData:(NSString*)sportData :(int)mode;

-(NSDictionary*)AnalysisTemperatureData:(NSString*)TemperatureData;

-(NSDictionary*)AnalysisUltravioletData:(NSString*)UltravioletData;

-(NSDictionary*)AnalysisAboutData:(NSString*)AboutData;

-(NSDictionary*)AnalysisSportStepNumberData:(NSString*)sportStepNumberData;
//解析开关状态 callSwitch来电，1为开，0为关，默认为关，notifySwitch消息，1为开，0为关，默认为关，
-(NSDictionary*)AnalysisSwitchState:(NSString*)SwitchStateData  :(int)mode;

//解析一个小时的运动数据
-(NSDictionary*)AnalysisOneHourSport:(NSString*)OneHourSportData;
//解析获取链接断开状态
//-(NSDictionary*)AnalysisconState:(NSString*)StateData;

-(NSDictionary*)AnalysisHumitureData:(NSString*)HumitureData;

//解析心率数据
-(NSDictionary*)AnalysisHeartRateData:(NSString*)HeartRateData;



//电子秤

//时间不同步删掉的的数据
-(NSDictionary*)AnalysisDeleteFromDiffTime:(NSString*)Data;

//版本解析
-(NSDictionary*)AnalysisVersion:(NSString*)Data;

//解析当前时间
-(NSDictionary*)AnalysisCurrTime:(NSString*)Data;

//根据体重删除记录总数
-(NSDictionary*)AnalysiWDeleteCount:(NSString*)Data;

//根据时间删除记录总数
-(NSDictionary*)AnalysisTDeleteCount:(NSString*)Data;

//写入序列号返回值
-(NSDictionary*)AnalysisSN:(NSString*)Data;


//读取序列号返回值
-(NSDictionary*)AnalysisReadSN:(NSString*)Data;


//得到电子所有记录的解析一条一条返回
-(NSDictionary*)AnalysisrRecode:(NSString*)Data;


//得到临时体重解析
-(NSDictionary*)AnalysisrTemporary:(NSString*)Data;


//解析实际体重

-(NSDictionary*)AnalysisrActual:(NSString*)Data;

 //解析返回值
-(NSDictionary*)AnalysisrResult:(NSString*)Data;


@end
