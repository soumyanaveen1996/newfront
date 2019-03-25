//
//  QueueServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "QueueServiceClient.h"
#import "Queueservice.pbrpc.h"
#import "QueueMessage+frontm.h"
#import "Message+frontm.h"
#import "QueueResponse+frontm.h"

#import <RxLibrary/GRXWriter+Immediate.h>
#import <RxLibrary/GRXWriter+Transformations.h>

#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface QueueServiceClient()

@property (strong, nonatomic) QueueService *serviceClient;
@property (strong, nonatomic) GRXWriter *grxWriter;

@end

@interface EmptyContent : NSObject<GRXWriteable>

@end


@implementation QueueServiceClient

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[QueueService alloc] initWithHost:kHostAddress];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[
           @"message",
           @"end"
           ];

}

- (GRXWriter *)grxWriter {
  if (_grxWriter == nil) {
    _grxWriter = [GRXWriter emptyWriter];
  }
  return _grxWriter;
}


RCT_REMAP_METHOD(getAllQueueMessages, getAllQueueMessagesWithSessionId:(NSString *)sessionId) {
  GRPCProtoCall *call = [self.serviceClient RPCToGetAllQueueMessagesWithRequest:[Empty new] eventHandler:^(BOOL done, QueueResponse * _Nullable response, NSError * _Nullable error) {
    if (done) {
      [self sendEventWithName:@"end" body:@{}];
    } else {
      [self sendEventWithName:@"message" body:[response toJSON]];
    }
  }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

/*
RCT_REMAP_METHOD(getSampleMessages, getSampleMessagesWithSessionId:(NSString *)sessionId) {
  GRPCProtoCall *call = [self.serviceClient RPCToGetSampleMessagesWithRequest:[Empty new] eventHandler:^(BOOL done, MessageList * _Nullable response, NSError * _Nullable error) {
    if (done) {
      [self sendEventWithName:@"end" body:@{}];
    } else {
      [self sendEventWithName:@"message" body:[response toJSON]];
    }
  }];
  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
} */

RCT_REMAP_METHOD(startChatSSE, startChatSSEWithSessionId:(NSString *)sessionId) {

  /*
  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetSampleBufferedMessageWithRequest:[Empty new] eventHandler:^(BOOL done, BufferMessage * _Nullable response, NSError * _Nullable error) {
                           NSError *jsonError = nil;
                           NSString *myString = [[NSString alloc] initWithData:response.message encoding:NSUTF8StringEncoding];

                           RCTLog(@"Done startChatSSE : %d %@ %@", done, myString, jsonError);
                           if (done) {
                             [self sendEventWithName:@"end" body:@{}];
                           } else {
                             [self sendEventWithName:@"message" body:response.message];
                           }

                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start]; */

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetStreamingQueueMessageWithRequest:[Empty new] eventHandler:^(BOOL done, QueueMessage * _Nullable response, NSError * _Nullable error) {
                           if (done) {
                             [self sendEventWithName:@"end" body:@{}];
                           } else {
                             [self sendEventWithName:@"message" body:[response toJSON]];
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

/*
RCT_REMAP_METHOD(startSampleChatSSE, startSampleChatSSEWithSessionId:(NSString *)sessionId) {
  GRPCProtoCall *call = [self.serviceClient RPCToGetSampleStreamingMessagesWithRequest:[Empty new] eventHandler:^(BOOL done, Message * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"Done : %d %@", done, [response toJSON]);
    if (done) {
      [self sendEventWithName:@"end" body:@{}];
    } else {
      [self sendEventWithName:@"message" body:[response toJSON]];
    }
  }];
  //[self.grxWriter startWithWriteable:[Empty new]];
  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}*/


@end
