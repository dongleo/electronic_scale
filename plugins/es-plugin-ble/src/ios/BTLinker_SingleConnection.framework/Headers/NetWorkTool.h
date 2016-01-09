//
//  NetWorkTool.h
//  TijiyiClone
//
//  Created by xiejunpeng on 14-7-30.
//  Copyright (c) 2014年 twohe. All rights reserved.
//

#import <Foundation/Foundation.h>


@protocol NetWorkDelegate <NSObject>


-(void)getDataFromServer:(id)responseObject;


@optional


//-(void)Updatafaill:(NSString*)fail;



@end


@interface NetWorkTool : NSObject{

id<NetWorkDelegate>delegate;

}


@property (strong,nonatomic) id<NetWorkDelegate>delegate;


+(NetWorkTool*)getNetWorkToolInstance;

- (void)downloadFileURL:(NSMutableArray *)aFileName;


@end
