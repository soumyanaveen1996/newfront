/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>

#import "AppDelegate.h"

#import <GRPCClient/GRPCCall+ChannelArg.h>
#import <GRPCClient/GRPCCall+Tests.h>


static NSString * const kHostAddress = @"3.80.242.247:50051";


int main(int argc, char * argv[]) {
  @autoreleasepool {
    [GRPCCall useInsecureConnectionsForHost:kHostAddress];
    [GRPCCall setUserAgentPrefix:@"FrontM/1.0" forHost:kHostAddress];
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
