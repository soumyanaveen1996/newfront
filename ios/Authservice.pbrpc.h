#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Authservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class Empty;
@class FrontmSigninInput;
@class GoogleSigninInput;
@class SigninResponse;
@class SignupResponse;
@class SignupUser;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
  #import "Commonmessages.pbobjc.h"
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol AuthService <NSObject>

#pragma mark Signup(SignupUser) returns (SignupResponse)

- (void)signupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToSignupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ConfirmSignup(SignupUser) returns (SignupResponse)

- (void)confirmSignupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToConfirmSignupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ResendSignupConfirmCode(SignupUser) returns (SignupResponse)

- (void)resendSignupConfirmCodeWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToResendSignupConfirmCodeWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ResetPassword(SignupUser) returns (SignupResponse)

- (void)resetPasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToResetPasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ConfirmPasswordReset(SignupUser) returns (SignupResponse)

- (void)confirmPasswordResetWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToConfirmPasswordResetWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ChangePassword(SignupUser) returns (SignupResponse)

- (void)changePasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToChangePasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark DeleteUser(Empty) returns (SignupResponse)

- (void)deleteUserWithRequest:(Empty *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToDeleteUserWithRequest:(Empty *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark FrontmSignin(FrontmSigninInput) returns (SigninResponse)

- (void)frontmSigninWithRequest:(FrontmSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToFrontmSigninWithRequest:(FrontmSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GoogleSignin(GoogleSigninInput) returns (SigninResponse)

- (void)googleSigninWithRequest:(GoogleSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGoogleSigninWithRequest:(GoogleSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface AuthService : GRPCProtoService<AuthService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

