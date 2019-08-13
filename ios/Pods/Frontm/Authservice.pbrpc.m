#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Authservice.pbrpc.h"
#import "Authservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation AuthService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"auth"
                 serviceName:@"AuthService"];
  return self;
}

// Override superclass initializer to disallow different package and service names.
- (instancetype)initWithHost:(NSString *)host
                 packageName:(NSString *)packageName
                 serviceName:(NSString *)serviceName {
  return [self initWithHost:host];
}

#pragma mark - Class Methods

+ (instancetype)serviceWithHost:(NSString *)host {
  return [[self alloc] initWithHost:host];
}

#pragma mark - Method Implementations

#pragma mark Signup(SignupUser) returns (SignupResponse)

- (void)signupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToSignupWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToSignupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Signup"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ConfirmSignup(SignupUser) returns (SignupResponse)

- (void)confirmSignupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToConfirmSignupWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToConfirmSignupWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ConfirmSignup"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ResendSignupConfirmCode(SignupUser) returns (SignupResponse)

- (void)resendSignupConfirmCodeWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToResendSignupConfirmCodeWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToResendSignupConfirmCodeWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ResendSignupConfirmCode"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ResetPassword(SignupUser) returns (SignupResponse)

- (void)resetPasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToResetPasswordWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToResetPasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ResetPassword"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ConfirmPasswordReset(SignupUser) returns (SignupResponse)

- (void)confirmPasswordResetWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToConfirmPasswordResetWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToConfirmPasswordResetWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ConfirmPasswordReset"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ChangePassword(SignupUser) returns (SignupResponse)

- (void)changePasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToChangePasswordWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToChangePasswordWithRequest:(SignupUser *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ChangePassword"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark DeleteUser(Empty) returns (SignupResponse)

- (void)deleteUserWithRequest:(Empty *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToDeleteUserWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToDeleteUserWithRequest:(Empty *)request handler:(void(^)(SignupResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"DeleteUser"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SignupResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark FrontmSignin(FrontmSigninInput) returns (SigninResponse)

- (void)frontmSigninWithRequest:(FrontmSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToFrontmSigninWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToFrontmSigninWithRequest:(FrontmSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"FrontmSignin"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SigninResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GoogleSignin(GoogleSigninInput) returns (SigninResponse)

- (void)googleSigninWithRequest:(GoogleSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGoogleSigninWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGoogleSigninWithRequest:(GoogleSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GoogleSignin"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SigninResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark FacebookSignin(FacebookSigninInput) returns (SigninResponse)

- (void)facebookSigninWithRequest:(FacebookSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToFacebookSigninWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToFacebookSigninWithRequest:(FacebookSigninInput *)request handler:(void(^)(SigninResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"FacebookSignin"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SigninResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
