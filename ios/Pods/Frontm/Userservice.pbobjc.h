// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: userservice.proto

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

@class CallHistoryObject;
@class Contact;
@class DomainRoles;
@class LocalContact;
@class ManageTncObject;
@class PhoneNumbers;
@class SubscribedBotsContent;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - UserserviceRoot

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
@interface UserserviceRoot : GPBRootObject
@end

#pragma mark - User

typedef GPB_ENUM(User_FieldNumber) {
  User_FieldNumber_UserName = 1,
  User_FieldNumber_EmailAddress = 2,
  User_FieldNumber_PhoneNumbers = 3,
  User_FieldNumber_Searchable = 4,
  User_FieldNumber_Visible = 5,
  User_FieldNumber_UserId = 6,
  User_FieldNumber_CompanyId = 7,
};

@interface User : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *emailAddress;

@property(nonatomic, readwrite, strong, null_resettable) PhoneNumbers *phoneNumbers;
/** Test to see if @c phoneNumbers has been set. */
@property(nonatomic, readwrite) BOOL hasPhoneNumbers;

@property(nonatomic, readwrite) BOOL searchable;

@property(nonatomic, readwrite) BOOL visible;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *companyId;

@end

#pragma mark - UpdateUserProfileResponse

typedef GPB_ENUM(UpdateUserProfileResponse_FieldNumber) {
  UpdateUserProfileResponse_FieldNumber_Error = 1,
  UpdateUserProfileResponse_FieldNumber_ContentArray = 2,
};

@interface UpdateUserProfileResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) GPBBoolArray *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - BotSubscriptionsResponse

typedef GPB_ENUM(BotSubscriptionsResponse_FieldNumber) {
  BotSubscriptionsResponse_FieldNumber_Error = 1,
  BotSubscriptionsResponse_FieldNumber_Content = 2,
};

@interface BotSubscriptionsResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) SubscribedBotsContent *content;
/** Test to see if @c content has been set. */
@property(nonatomic, readwrite) BOOL hasContent;

@end

#pragma mark - SubscribedBotsContent

typedef GPB_ENUM(SubscribedBotsContent_FieldNumber) {
  SubscribedBotsContent_FieldNumber_SubscribedArray = 1,
  SubscribedBotsContent_FieldNumber_FavouritesArray = 2,
};

@interface SubscribedBotsContent : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *subscribedArray;
/** The number of items in @c subscribedArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger subscribedArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *favouritesArray;
/** The number of items in @c favouritesArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger favouritesArray_Count;

@end

#pragma mark - ContactsResponse

typedef GPB_ENUM(ContactsResponse_FieldNumber) {
  ContactsResponse_FieldNumber_ContactsArray = 1,
  ContactsResponse_FieldNumber_IgnoredArray = 2,
  ContactsResponse_FieldNumber_LocalContactsArray = 3,
  ContactsResponse_FieldNumber_Sites = 4,
};

@interface ContactsResponse : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<Contact*> *contactsArray;
/** The number of items in @c contactsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contactsArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<Contact*> *ignoredArray;
/** The number of items in @c ignoredArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger ignoredArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<LocalContact*> *localContactsArray;
/** The number of items in @c localContactsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger localContactsArray_Count;

@property(nonatomic, readwrite, copy, null_resettable) NSString *sites;

@end

#pragma mark - Contact

typedef GPB_ENUM(Contact_FieldNumber) {
  Contact_FieldNumber_UserName = 1,
  Contact_FieldNumber_EmailAddress = 2,
  Contact_FieldNumber_PhoneNumbers = 3,
  Contact_FieldNumber_UserId = 4,
  Contact_FieldNumber_WaitingForConfirmation = 5,
};

@interface Contact : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *emailAddress;

@property(nonatomic, readwrite, strong, null_resettable) PhoneNumbers *phoneNumbers;
/** Test to see if @c phoneNumbers has been set. */
@property(nonatomic, readwrite) BOOL hasPhoneNumbers;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite) BOOL waitingForConfirmation;

@end

#pragma mark - SubscribeBotInput

typedef GPB_ENUM(SubscribeBotInput_FieldNumber) {
  SubscribeBotInput_FieldNumber_BotId = 1,
};

@interface SubscribeBotInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

@end

#pragma mark - SubscribeBotResponse

typedef GPB_ENUM(SubscribeBotResponse_FieldNumber) {
  SubscribeBotResponse_FieldNumber_Error = 1,
  SubscribeBotResponse_FieldNumber_ContentArray = 2,
};

@interface SubscribeBotResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) GPBBoolArray *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - SubscribeDomainInput

typedef GPB_ENUM(SubscribeDomainInput_FieldNumber) {
  SubscribeDomainInput_FieldNumber_VerificationCode = 1,
};

@interface SubscribeDomainInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *verificationCode;

@end

#pragma mark - SubscribeDomainResponse

typedef GPB_ENUM(SubscribeDomainResponse_FieldNumber) {
  SubscribeDomainResponse_FieldNumber_ContentArray = 1,
  SubscribeDomainResponse_FieldNumber_Error = 2,
};

@interface SubscribeDomainResponse : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<DomainRoles*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@property(nonatomic, readwrite) int32_t error;

@end

#pragma mark - VoipToggleResponse

typedef GPB_ENUM(VoipToggleResponse_FieldNumber) {
  VoipToggleResponse_FieldNumber_Success = 1,
};

@interface VoipToggleResponse : GPBMessage

@property(nonatomic, readwrite) BOOL success;

@end

#pragma mark - VoipStatusInput

typedef GPB_ENUM(VoipStatusInput_FieldNumber) {
  VoipStatusInput_FieldNumber_UserId = 1,
};

@interface VoipStatusInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@end

#pragma mark - VoipStatusResponse

typedef GPB_ENUM(VoipStatusResponse_FieldNumber) {
  VoipStatusResponse_FieldNumber_VoipEnabled = 1,
  VoipStatusResponse_FieldNumber_Error = 2,
};

@interface VoipStatusResponse : GPBMessage

@property(nonatomic, readwrite) BOOL voipEnabled;

@property(nonatomic, readwrite) int32_t error;

@end

#pragma mark - TwilioTokenInput

typedef GPB_ENUM(TwilioTokenInput_FieldNumber) {
  TwilioTokenInput_FieldNumber_Platform = 1,
  TwilioTokenInput_FieldNumber_Env = 2,
};

@interface TwilioTokenInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *platform;

@property(nonatomic, readwrite, copy, null_resettable) NSString *env;

@end

#pragma mark - TwilioTokenResponse

typedef GPB_ENUM(TwilioTokenResponse_FieldNumber) {
  TwilioTokenResponse_FieldNumber_AccessToken = 1,
};

@interface TwilioTokenResponse : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *accessToken;

@end

#pragma mark - ManageTncInput

typedef GPB_ENUM(ManageTncInput_FieldNumber) {
  ManageTncInput_FieldNumber_Action = 1,
};

@interface ManageTncInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *action;

@end

#pragma mark - ManageTncResponse

typedef GPB_ENUM(ManageTncResponse_FieldNumber) {
  ManageTncResponse_FieldNumber_Error = 1,
  ManageTncResponse_FieldNumber_ContentArray = 2,
};

@interface ManageTncResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<ManageTncObject*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - ManageTncObject

typedef GPB_ENUM(ManageTncObject_FieldNumber) {
  ManageTncObject_FieldNumber_TncAccept = 1,
};

@interface ManageTncObject : GPBMessage

@property(nonatomic, readwrite) BOOL tncAccept;

@end

#pragma mark - CompaniesResponse

typedef GPB_ENUM(CompaniesResponse_FieldNumber) {
  CompaniesResponse_FieldNumber_CompaniesArray = 1,
};

@interface CompaniesResponse : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *companiesArray;
/** The number of items in @c companiesArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger companiesArray_Count;

@end

#pragma mark - CallHistoryResponse

typedef GPB_ENUM(CallHistoryResponse_FieldNumber) {
  CallHistoryResponse_FieldNumber_ContentArray = 1,
};

@interface CallHistoryResponse : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<CallHistoryObject*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - CallHistoryObject

typedef GPB_ENUM(CallHistoryObject_FieldNumber) {
  CallHistoryObject_FieldNumber_CallCharge = 1,
  CallHistoryObject_FieldNumber_CallTimestamp = 2,
  CallHistoryObject_FieldNumber_CurrentBalance = 3,
  CallHistoryObject_FieldNumber_Duration = 4,
  CallHistoryObject_FieldNumber_UserId = 5,
  CallHistoryObject_FieldNumber_CallType = 6,
  CallHistoryObject_FieldNumber_CallDirection = 7,
  CallHistoryObject_FieldNumber_FromUserId = 8,
  CallHistoryObject_FieldNumber_FromUserName = 9,
  CallHistoryObject_FieldNumber_ToNumber = 10,
  CallHistoryObject_FieldNumber_ToUserId = 11,
  CallHistoryObject_FieldNumber_ToUserName = 12,
};

@interface CallHistoryObject : GPBMessage

@property(nonatomic, readwrite) int32_t callCharge;

@property(nonatomic, readwrite) int64_t callTimestamp;

@property(nonatomic, readwrite) float currentBalance;

@property(nonatomic, readwrite) int32_t duration;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *callType;

@property(nonatomic, readwrite, copy, null_resettable) NSString *callDirection;

@property(nonatomic, readwrite, copy, null_resettable) NSString *fromUserId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *fromUserName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *toNumber;

@property(nonatomic, readwrite, copy, null_resettable) NSString *toUserId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *toUserName;

@end

#pragma mark - TopupBalanceInput

typedef GPB_ENUM(TopupBalanceInput_FieldNumber) {
  TopupBalanceInput_FieldNumber_PaymentCode = 1,
  TopupBalanceInput_FieldNumber_Amount = 2,
  TopupBalanceInput_FieldNumber_Token = 3,
  TopupBalanceInput_FieldNumber_Platform = 4,
};

@interface TopupBalanceInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *paymentCode;

@property(nonatomic, readwrite) double amount;

@property(nonatomic, readwrite, copy, null_resettable) NSString *token;

@property(nonatomic, readwrite, copy, null_resettable) NSString *platform;

@end

#pragma mark - TopupBalanceResponse

typedef GPB_ENUM(TopupBalanceResponse_FieldNumber) {
  TopupBalanceResponse_FieldNumber_Error = 1,
};

@interface TopupBalanceResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
