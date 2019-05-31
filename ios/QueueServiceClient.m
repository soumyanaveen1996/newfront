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
#import "GRPCMetadata.h"


@interface QueueServiceClient()

@property (strong, nonatomic) QueueService *serviceClient;
@property (strong, nonatomic) GRXWriter *grxWriter;
@property  BOOL alreadyListening;
@property (strong, nonatomic) GRPCProtoCall *sseCall;
@property (strong, nonatomic) NSString *sessionId;

@end

@interface EmptyContent : NSObject<GRXWriteable>

@end


@implementation QueueServiceClient

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[QueueService alloc] initWithHost:GRPCMetadata.shared.uri];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[
           @"message",
           @"end",
           @"logout",
           @"sse_message",
           @"sse_end",
           @"sse_error"
           ];

}

- (GRXWriter *)grxWriter {
  if (_grxWriter == nil) {
    _grxWriter = [GRXWriter emptyWriter];
  }
  return _grxWriter;
}


RCT_REMAP_METHOD(getAllQueueMessages, getAllQueueMessagesWithSessionId:(NSString *)sessionId) {
  RCTLog(@"Reading Remote Lambda");
  GRPCProtoCall *call = [self.serviceClient RPCToGetAllQueueMessagesWithRequest:[Empty new] eventHandler:^(BOOL done, QueueResponse * _Nullable response, NSError * _Nullable error) {
    if (error) {
      if (error.code == 16) {
        [self sendEventWithName:@"logout" body:@{}];
      }
      RCTLog(@"Error in getAllQueueMessages %@", [error description]);
      return;
    }
    if (done) {
      RCTLog(@"Reading Done");
      [self sendEventWithName:@"end" body:@{}];
    } else {
      RCTLog(@"---------------Sending Remote Lambda response------------");
      [self sendEventWithName:@"message" body:[response toResponse]];
    }
  }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}



- (void) handleError {
  self.alreadyListening = NO;
  [self.sseCall cancel];
  self.sseCall = nil;
  [NSThread sleepForTimeInterval:3.0f];
  [self startChatSSEWithSessionId:self.sessionId];
}

RCT_REMAP_METHOD(startChatSSE, startChatSSEWithSessionId:(NSString *)sessionId) {


  if (self.alreadyListening && [sessionId isEqualToString:self.sessionId]) {
    return;
  }

  if (![sessionId isEqualToString:self.sessionId]) {
    if (self.sseCall) {
      [self.sseCall cancel];
      self.sseCall = nil;
    }
  }

  if (!sessionId || [sessionId isEqual:[NSNull null]] || [sessionId isEqualToString:@""]) {
    return;
  }

  self.alreadyListening = YES;
  self.sessionId = sessionId;

  self.sseCall = [self.serviceClient
                         RPCToGetStreamingQueueMessageWithRequest:[Empty new] eventHandler:^(BOOL done, QueueMessage * _Nullable response, NSError * _Nullable error) {

                           RCTLog(@"GRPC:::SSE Done : %d %@ %@", done, error, [response toJSON]);
                           if (error != nil) {
                             [self handleError];
                             RCTLog(@"GRPC:::SSE error %@ %@", error, [response toJSON]);
                             [self sendEventWithName:@"sse_error" body:@{}];
                           } else if (done) {
                             RCTLog(@"GRPC:::SSE done %@ %@", error, [response toJSON]);
                             [self sendEventWithName:@"sse_end" body:@{}];
                           } else {
                             RCTLog(@"GRPC:::SSE message %@ %@", error, [response toJSON]);
                             [self sendEventWithName:@"sse_message" body:[response toJSON]];
                           }
                         }];

  self.sseCall.requestHeaders[@"sessionId"] = sessionId;
  [self.sseCall start];
}


RCT_REMAP_METHOD(logout, logout) {
  self.alreadyListening = NO;
  [self.sseCall cancel];
  self.sseCall = nil;
  self.sessionId = nil;
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
