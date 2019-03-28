// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: authservice.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBProtocolBuffers.h>
#else
 #import "GPBProtocolBuffers.h"
#endif

#if GOOGLE_PROTOBUF_OBJC_VERSION < 30002
#error This file was generated by a newer version of protoc which is incompatible with your Protocol Buffer library sources.
#endif
#if 30002 < GOOGLE_PROTOBUF_OBJC_MIN_SUPPORTED_VERSION
#error This file was generated by an older version of protoc which is incompatible with your Protocol Buffer library sources.
#endif

// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

CF_EXTERN_C_BEGIN

@class DomainRoles;
@class PhoneNumbers;
@class SignInUser;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - AuthserviceRoot

/**
 * Exposes the extension registry for this file.
 *
 * The base class provides:
 * @code
 *   + (GPBExtensionRegistry *)extensionRegistry;
 * @endcode
 * which is a @c GPBExtensionRegistry that includes all the extensions defined by
 * this file and all files that it depends on.
 **/
@interface AuthserviceRoot : GPBRootObject
@end

#pragma mark - SignupUser

typedef GPB_ENUM(SignupUser_FieldNumber) {
  SignupUser_FieldNumber_Email = 1,
  SignupUser_FieldNumber_UserName = 2,
  SignupUser_FieldNumber_Password = 3,
  SignupUser_FieldNumber_ConfirmCode = 4,
  SignupUser_FieldNumber_OldPassword = 5,
  SignupUser_FieldNumber_NewPassword = 6,
  SignupUser_FieldNumber_VerificationCode = 7,
};

@interface SignupUser : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *email;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *password;

@property(nonatomic, readwrite, copy, null_resettable) NSString *confirmCode;

@property(nonatomic, readwrite, copy, null_resettable) NSString *oldPassword;

@property(nonatomic, readwrite, copy, null_resettable) NSString *newPassword NS_RETURNS_NOT_RETAINED;

@property(nonatomic, readwrite, copy, null_resettable) NSString *verificationCode;

@end

#pragma mark - SignupResponse

typedef GPB_ENUM(SignupResponse_FieldNumber) {
  SignupResponse_FieldNumber_Success = 1,
  SignupResponse_FieldNumber_Data_p = 2,
  SignupResponse_FieldNumber_Message = 3,
};

@interface SignupResponse : GPBMessage

@property(nonatomic, readwrite) BOOL success;

@property(nonatomic, readwrite, copy, null_resettable) NSString *data_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *message;

@end

#pragma mark - FrontmSigninInput

typedef GPB_ENUM(FrontmSigninInput_FieldNumber) {
  FrontmSigninInput_FieldNumber_Email = 1,
  FrontmSigninInput_FieldNumber_Password = 2,
  FrontmSigninInput_FieldNumber_Platform = 3,
};

@interface FrontmSigninInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *email;

@property(nonatomic, readwrite, copy, null_resettable) NSString *password;

@property(nonatomic, readwrite, copy, null_resettable) NSString *platform;

@end

#pragma mark - GoogleSigninInput

typedef GPB_ENUM(GoogleSigninInput_FieldNumber) {
  GoogleSigninInput_FieldNumber_Code = 1,
  GoogleSigninInput_FieldNumber_Platform = 2,
  GoogleSigninInput_FieldNumber_IdToken = 3,
  GoogleSigninInput_FieldNumber_RefreshToken = 4,
};

@interface GoogleSigninInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *code;

@property(nonatomic, readwrite, copy, null_resettable) NSString *platform;

@property(nonatomic, readwrite, copy, null_resettable) NSString *idToken;

@property(nonatomic, readwrite, copy, null_resettable) NSString *refreshToken;

@end

#pragma mark - SigninResponse

typedef GPB_ENUM(SigninResponse_FieldNumber) {
  SigninResponse_FieldNumber_Success = 1,
  SigninResponse_FieldNumber_Message = 2,
  SigninResponse_FieldNumber_SessionId = 3,
  SigninResponse_FieldNumber_User = 4,
  SigninResponse_FieldNumber_NewUser = 5,
};

@interface SigninResponse : GPBMessage

@property(nonatomic, readwrite) BOOL success;

@property(nonatomic, readwrite, copy, null_resettable) NSString *message;

@property(nonatomic, readwrite, copy, null_resettable) NSString *sessionId;

@property(nonatomic, readwrite, strong, null_resettable) SignInUser *user;
/** Test to see if @c user has been set. */
@property(nonatomic, readwrite) BOOL hasUser;

@property(nonatomic, readwrite) BOOL newUser;

@end

#pragma mark - SignInUser

typedef GPB_ENUM(SignInUser_FieldNumber) {
  SignInUser_FieldNumber_Searchable = 1,
  SignInUser_FieldNumber_Visible = 2,
  SignInUser_FieldNumber_EmailAddress = 3,
  SignInUser_FieldNumber_UserId = 4,
  SignInUser_FieldNumber_PhoneNumbers = 5,
  SignInUser_FieldNumber_UserName = 6,
  SignInUser_FieldNumber_DomainsArray = 7,
  SignInUser_FieldNumber_ArchiveMessages = 8,
  SignInUser_FieldNumber_TncAccept = 9,
};

@interface SignInUser : GPBMessage

@property(nonatomic, readwrite) BOOL searchable;

@property(nonatomic, readwrite) BOOL visible;

@property(nonatomic, readwrite, copy, null_resettable) NSString *emailAddress;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, strong, null_resettable) PhoneNumbers *phoneNumbers;
/** Test to see if @c phoneNumbers has been set. */
@property(nonatomic, readwrite) BOOL hasPhoneNumbers;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<DomainRoles*> *domainsArray;
/** The number of items in @c domainsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger domainsArray_Count;

@property(nonatomic, readwrite) BOOL archiveMessages;

@property(nonatomic, readwrite) BOOL tncAccept;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
