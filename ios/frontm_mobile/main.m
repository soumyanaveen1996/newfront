/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>

#import "AppDelegate.h"

#import <GRPCClient/GRPCCall+ChannelArg.h>
#import <GRPCClient/GRPCCall+ChannelCredentials.h>
#import <GRPCClient/GRPCCall+Tests.h>




static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";


int main(int argc, char * argv[]) {
  @autoreleasepool {

    NSString *certsPath = [[NSBundle mainBundle] pathForResource:@"sectigoSHA2" ofType:@"ca-bundle"];
    NSError *error;
    NSString *contentInUTF8 = [NSString stringWithContentsOfFile:certsPath
                                                        encoding:NSUTF8StringEncoding
                                                           error:&error];

    [GRPCCall setTLSPEMRootCerts:contentInUTF8
                         forHost:kHostAddress
                           error:nil];

    [GRPCCall setUserAgentPrefix:@"FrontM/1.0" forHost:kHostAddress];
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
