//
//  GRPCMetadata.m
//  frontm_mobile
//
//  Created by Amal on 3/29/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GRPCMetadata.h"

@implementation GRPCMetadata

+ (instancetype) shared {
  static GRPCMetadata *_shared = nil;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    _shared = [[GRPCMetadata alloc] init];
    _shared.port = [GRPCMetadata grpcPort];
    _shared.host = [GRPCMetadata grpcHost];
  });
  return _shared;

}

+ (NSString *) grpcPort {
  return [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GRPC_PORT"];
}


+ (NSString *) grpcHost {
  return [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GRPC_HOST"];
}


- (NSString *) uri {
  return [NSString stringWithFormat:@"%@:%@", self.host, self.port];
}


@end
