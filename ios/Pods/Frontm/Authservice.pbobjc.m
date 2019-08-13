// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: authservice.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBProtocolBuffers_RuntimeSupport.h>
#else
 #import "GPBProtocolBuffers_RuntimeSupport.h"
#endif

#import "Authservice.pbobjc.h"
#import "Commonmessages.pbobjc.h"
// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

#pragma mark - AuthserviceRoot

@implementation AuthserviceRoot

// No extensions in the file and none of the imports (direct or indirect)
// defined extensions, so no need to generate +extensionRegistry.

@end

#pragma mark - AuthserviceRoot_FileDescriptor

static GPBFileDescriptor *AuthserviceRoot_FileDescriptor(void) {
  // This is called by +initialize so there is no need to worry
  // about thread safety of the singleton.
  static GPBFileDescriptor *descriptor = NULL;
  if (!descriptor) {
    GPB_DEBUG_CHECK_RUNTIME_VERSIONS();
    descriptor = [[GPBFileDescriptor alloc] initWithPackage:@"auth"
                                                     syntax:GPBFileSyntaxProto3];
  }
  return descriptor;
}

#pragma mark - SignupUser

@implementation SignupUser

@dynamic email;
@dynamic userName;
@dynamic password;
@dynamic confirmCode;
@dynamic oldPassword;
@dynamic newPassword;
@dynamic verificationCode;

typedef struct SignupUser__storage_ {
  uint32_t _has_storage_[1];
  NSString *email;
  NSString *userName;
  NSString *password;
  NSString *confirmCode;
  NSString *oldPassword;
  NSString *newPassword;
  NSString *verificationCode;
} SignupUser__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "email",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_Email,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(SignupUser__storage_, email),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "userName",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_UserName,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(SignupUser__storage_, userName),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "password",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_Password,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(SignupUser__storage_, password),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "confirmCode",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_ConfirmCode,
        .hasIndex = 3,
        .offset = (uint32_t)offsetof(SignupUser__storage_, confirmCode),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "oldPassword",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_OldPassword,
        .hasIndex = 4,
        .offset = (uint32_t)offsetof(SignupUser__storage_, oldPassword),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "newPassword",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_NewPassword,
        .hasIndex = 5,
        .offset = (uint32_t)offsetof(SignupUser__storage_, newPassword),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "verificationCode",
        .dataTypeSpecific.className = NULL,
        .number = SignupUser_FieldNumber_VerificationCode,
        .hasIndex = 6,
        .offset = (uint32_t)offsetof(SignupUser__storage_, verificationCode),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[SignupUser class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(SignupUser__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\005\002\010\000\004\013\000\005\013\000\006\013\000\007\020\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - SignupResponse

@implementation SignupResponse

@dynamic success;
@dynamic data_p;
@dynamic message;

typedef struct SignupResponse__storage_ {
  uint32_t _has_storage_[1];
  NSString *data_p;
  NSString *message;
} SignupResponse__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "success",
        .dataTypeSpecific.className = NULL,
        .number = SignupResponse_FieldNumber_Success,
        .hasIndex = 0,
        .offset = 1,  // Stored in _has_storage_ to save space.
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeBool,
      },
      {
        .name = "data_p",
        .dataTypeSpecific.className = NULL,
        .number = SignupResponse_FieldNumber_Data_p,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(SignupResponse__storage_, data_p),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "message",
        .dataTypeSpecific.className = NULL,
        .number = SignupResponse_FieldNumber_Message,
        .hasIndex = 3,
        .offset = (uint32_t)offsetof(SignupResponse__storage_, message),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[SignupResponse class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(SignupResponse__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - FrontmSigninInput

@implementation FrontmSigninInput

@dynamic email;
@dynamic password;
@dynamic platform;

typedef struct FrontmSigninInput__storage_ {
  uint32_t _has_storage_[1];
  NSString *email;
  NSString *password;
  NSString *platform;
} FrontmSigninInput__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "email",
        .dataTypeSpecific.className = NULL,
        .number = FrontmSigninInput_FieldNumber_Email,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(FrontmSigninInput__storage_, email),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "password",
        .dataTypeSpecific.className = NULL,
        .number = FrontmSigninInput_FieldNumber_Password,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(FrontmSigninInput__storage_, password),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "platform",
        .dataTypeSpecific.className = NULL,
        .number = FrontmSigninInput_FieldNumber_Platform,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(FrontmSigninInput__storage_, platform),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[FrontmSigninInput class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(FrontmSigninInput__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - GoogleSigninInput

@implementation GoogleSigninInput

@dynamic code;
@dynamic platform;
@dynamic idToken;
@dynamic refreshToken;

typedef struct GoogleSigninInput__storage_ {
  uint32_t _has_storage_[1];
  NSString *code;
  NSString *platform;
  NSString *idToken;
  NSString *refreshToken;
} GoogleSigninInput__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "code",
        .dataTypeSpecific.className = NULL,
        .number = GoogleSigninInput_FieldNumber_Code,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(GoogleSigninInput__storage_, code),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "platform",
        .dataTypeSpecific.className = NULL,
        .number = GoogleSigninInput_FieldNumber_Platform,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(GoogleSigninInput__storage_, platform),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "idToken",
        .dataTypeSpecific.className = NULL,
        .number = GoogleSigninInput_FieldNumber_IdToken,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(GoogleSigninInput__storage_, idToken),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "refreshToken",
        .dataTypeSpecific.className = NULL,
        .number = GoogleSigninInput_FieldNumber_RefreshToken,
        .hasIndex = 3,
        .offset = (uint32_t)offsetof(GoogleSigninInput__storage_, refreshToken),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[GoogleSigninInput class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(GoogleSigninInput__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\002\003\007\000\004\014\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - SigninResponse

@implementation SigninResponse

@dynamic success;
@dynamic message;
@dynamic sessionId;
@dynamic hasUser, user;
@dynamic newUser;

typedef struct SigninResponse__storage_ {
  uint32_t _has_storage_[1];
  NSString *message;
  NSString *sessionId;
  SignInUser *user;
} SigninResponse__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "success",
        .dataTypeSpecific.className = NULL,
        .number = SigninResponse_FieldNumber_Success,
        .hasIndex = 0,
        .offset = 1,  // Stored in _has_storage_ to save space.
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeBool,
      },
      {
        .name = "message",
        .dataTypeSpecific.className = NULL,
        .number = SigninResponse_FieldNumber_Message,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(SigninResponse__storage_, message),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "sessionId",
        .dataTypeSpecific.className = NULL,
        .number = SigninResponse_FieldNumber_SessionId,
        .hasIndex = 3,
        .offset = (uint32_t)offsetof(SigninResponse__storage_, sessionId),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "user",
        .dataTypeSpecific.className = GPBStringifySymbol(SignInUser),
        .number = SigninResponse_FieldNumber_User,
        .hasIndex = 4,
        .offset = (uint32_t)offsetof(SigninResponse__storage_, user),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeMessage,
      },
      {
        .name = "newUser",
        .dataTypeSpecific.className = NULL,
        .number = SigninResponse_FieldNumber_NewUser,
        .hasIndex = 5,
        .offset = 6,  // Stored in _has_storage_ to save space.
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeBool,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[SigninResponse class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(SigninResponse__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\002\003\t\000\005\007\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - SignInUser

@implementation SignInUser

@dynamic searchable;
@dynamic visible;
@dynamic emailAddress;
@dynamic userId;
@dynamic hasPhoneNumbers, phoneNumbers;
@dynamic userName;
@dynamic domainsArray, domainsArray_Count;
@dynamic archiveMessages;
@dynamic tncAccept;

typedef struct SignInUser__storage_ {
  uint32_t _has_storage_[1];
  NSString *emailAddress;
  NSString *userId;
  PhoneNumbers *phoneNumbers;
  NSString *userName;
  NSMutableArray *domainsArray;
} SignInUser__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "searchable",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_Searchable,
        .hasIndex = 0,
        .offset = 1,  // Stored in _has_storage_ to save space.
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeBool,
      },
      {
        .name = "visible",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_Visible,
        .hasIndex = 2,
        .offset = 3,  // Stored in _has_storage_ to save space.
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeBool,
      },
      {
        .name = "emailAddress",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_EmailAddress,
        .hasIndex = 4,
        .offset = (uint32_t)offsetof(SignInUser__storage_, emailAddress),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "userId",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_UserId,
        .hasIndex = 5,
        .offset = (uint32_t)offsetof(SignInUser__storage_, userId),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "phoneNumbers",
        .dataTypeSpecific.className = GPBStringifySymbol(PhoneNumbers),
        .number = SignInUser_FieldNumber_PhoneNumbers,
        .hasIndex = 6,
        .offset = (uint32_t)offsetof(SignInUser__storage_, phoneNumbers),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeMessage,
      },
      {
        .name = "userName",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_UserName,
        .hasIndex = 7,
        .offset = (uint32_t)offsetof(SignInUser__storage_, userName),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "domainsArray",
        .dataTypeSpecific.className = GPBStringifySymbol(DomainRoles),
        .number = SignInUser_FieldNumber_DomainsArray,
        .hasIndex = GPBNoHasBit,
        .offset = (uint32_t)offsetof(SignInUser__storage_, domainsArray),
        .flags = GPBFieldRepeated,
        .dataType = GPBDataTypeMessage,
      },
      {
        .name = "archiveMessages",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_ArchiveMessages,
        .hasIndex = 8,
        .offset = 9,  // Stored in _has_storage_ to save space.
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeBool,
      },
      {
        .name = "tncAccept",
        .dataTypeSpecific.className = NULL,
        .number = SignInUser_FieldNumber_TncAccept,
        .hasIndex = 10,
        .offset = 11,  // Stored in _has_storage_ to save space.
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeBool,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[SignInUser class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(SignInUser__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\006\003\014\000\004\006\000\005\014\000\006\010\000\010\017\000\t\t\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - FacebookSigninInput

@implementation FacebookSigninInput

@dynamic token;
@dynamic platform;
@dynamic userName;
@dynamic emailAddress;

typedef struct FacebookSigninInput__storage_ {
  uint32_t _has_storage_[1];
  NSString *token;
  NSString *platform;
  NSString *userName;
  NSString *emailAddress;
} FacebookSigninInput__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "token",
        .dataTypeSpecific.className = NULL,
        .number = FacebookSigninInput_FieldNumber_Token,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(FacebookSigninInput__storage_, token),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "platform",
        .dataTypeSpecific.className = NULL,
        .number = FacebookSigninInput_FieldNumber_Platform,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(FacebookSigninInput__storage_, platform),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "userName",
        .dataTypeSpecific.className = NULL,
        .number = FacebookSigninInput_FieldNumber_UserName,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(FacebookSigninInput__storage_, userName),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "emailAddress",
        .dataTypeSpecific.className = NULL,
        .number = FacebookSigninInput_FieldNumber_EmailAddress,
        .hasIndex = 3,
        .offset = (uint32_t)offsetof(FacebookSigninInput__storage_, emailAddress),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[FacebookSigninInput class]
                                     rootClass:[AuthserviceRoot class]
                                          file:AuthserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(FacebookSigninInput__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\002\003\010\000\004\014\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end


#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
