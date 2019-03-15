//
//  AuthServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/4/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "AuthServiceClient.h"
#import "Authservice.pbrpc.h"
#import "SignupResponse+frontm.h"
#import "SigninResponse+frontm.h"
#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface AuthServiceClient()

@property (strong, atomic) AuthService *serviceClient;

@end

@implementation AuthServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[AuthService alloc] initWithHost:kHostAddress];
  }
  return self;
}

RCT_REMAP_METHOD(signup, signupWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:signup Params : %@", params);
  SignupUser *user = [SignupUser new];
  user.email = params[@"email"];
  user.userName = params[@"userName"];
  user.password = params[@"password"];

  [self.serviceClient signupWithRequest:user handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"method:signup Error and response : %@ - %@ - %@ - %d", error, response.data_p, response.message, response.success);
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
}


RCT_REMAP_METHOD(confirmSignup, confirmSignupWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:confirmSignup Params : %@", params);
  SignupUser *user = [SignupUser new];
  user.email = params[@"email"];
  user.confirmCode = params[@"confirmCode"];

  [self.serviceClient confirmSignupWithRequest:user handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"method:confirmSignup Error and response : %@ %@ %@ %d", error, response.data_p, response.message, response.success);
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
}


RCT_REMAP_METHOD(resendSignupCode, resendSignupCodeWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:resendSignupCode Params : %@", params);
  SignupUser *user = [SignupUser new];
  user.email = params[@"email"];

  [self.serviceClient resendSignupConfirmCodeWithRequest:user handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"method:resendSignupCode Error and response : %@ %@ %@ %d", error, response.data_p, response.message, response.success);
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
}

RCT_REMAP_METHOD(resetPassword, resetPasswordWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:resetPassword Params : %@", params);
  SignupUser *user = [SignupUser new];
  user.email = params[@"email"];

  [self.serviceClient resetPasswordWithRequest:user handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"method:resetPassword Error and response : %@ %@ %@ %d", error, response.data_p, response.message, response.success);
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
}

RCT_REMAP_METHOD(confirmPasswordReset, confirmPasswordResetWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:confirmPasswordReset Params : %@", params);
  SignupUser *user = [SignupUser new];
  user.email = params[@"email"];
  user.verificationCode = params[@"verificationCode"];
  user.newPassword = params[@"newPassword"];

  [self.serviceClient confirmPasswordResetWithRequest:user handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"method:confirmPasswordReset Error and response : %@ %@ %@ %d", error, response.data_p, response.message, response.success);
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
}

RCT_REMAP_METHOD(changePassword, changePasswordWithSessionId:(NSString*)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:changePassword Params : %@", params);
  SignupUser *user = [SignupUser new];
  user.oldPassword = params[@"oldPassword"];
  user.newPassword = params[@"newPassword"];

  GRPCProtoCall *call = [self.serviceClient RPCToChangePasswordWithRequest:user
                                                               handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
                                                                 RCTLog(@"method:changePassword Error and response : %@ %@ %@ %d", error, response.data_p, response.message, response.success);
                                                                 if (error != nil) {
                                                                   callback(@[@{}, [NSNull null]]);
                                                                   return;
                                                                 } else {
                                                                   callback(@[[NSNull null], [response toResponse]]);
                                                                 }
                                                               }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];

}

RCT_REMAP_METHOD(deleteUser, deleteUserWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {

  GRPCProtoCall *call = [self.serviceClient RPCToDeleteUserWithRequest:[Empty new]
                                                               handler:^(SignupResponse * _Nullable response, NSError * _Nullable error) {
                                                                 if (error != nil) {
                                                                   callback(@[@{}, [NSNull null]]);
                                                                   return;
                                                                 } else {
                                                                   callback(@[[NSNull null], [response toJSON]]);
                                                                 }
                                                               }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}


RCT_REMAP_METHOD(frontmSignin, frontmSigninWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:signin Params : %@", params);
  FrontmSigninInput *input = [FrontmSigninInput new];
  input.email = params[@"email"];
  input.password = params[@"password"];
  input.platform = @"ios";

  [self.serviceClient frontmSigninWithRequest:input handler:^(SigninResponse * _Nullable response, NSError * _Nullable error) {
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
}


RCT_REMAP_METHOD(googleSignin, googleSigninWithParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:signup Params : %@", params);
  GoogleSigninInput *input = [GoogleSigninInput new];
  input.code = params[@"code"];
  input.platform = params[@"platform"];

  [self.serviceClient googleSigninWithRequest:input
                                      handler:^(SigninResponse * _Nullable response, NSError * _Nullable error) {
                                        if (error != nil) {
                                          callback(@[@{}, [NSNull null]]);
                                          return;
                                        } else {
                                          callback(@[[NSNull null], [response toResponse]]);
                                        }
                                      }];


}



@end
