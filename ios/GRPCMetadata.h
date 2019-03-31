//
//  GRPCMetadata.h
//  frontm_mobile
//
//  Created by Amal on 3/29/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface GRPCMetadata : NSObject

@property (nonatomic, retain) NSString *host;
@property (nonatomic, retain) NSString *port;

+ (instancetype) shared;
- (NSString *) uri;

@end

NS_ASSUME_NONNULL_END
