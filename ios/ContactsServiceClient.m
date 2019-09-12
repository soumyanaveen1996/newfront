//
//  ContactsServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ContactsServiceClient.h"
#import "Contactsservice.pbrpc.h"
#import "AgentGuardBoolResponse+frontm.h"
#import "FindResponse+frontm.h"
#import <React/RCTLog.h>
#import "GRPCMetadata.h"


@interface ContactsServiceClient()

@property (strong, atomic) ContactsService *serviceClient;

@end

@implementation ContactsServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[ContactsService alloc] initWithHost:GRPCMetadata.shared.uri];
  }
  return self;
}


RCT_REMAP_METHOD(find, findWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:find Params : %@", sessionId);

  SearchQuery *query = [SearchQuery new];
  query.queryString = params[@"queryString"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToFindWithRequest:query handler:^(FindResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             RCTLog(@"GRPC:::ContactService method:find Response : %@", [response toResponse]);
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(add, addWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService  method:add Params : %@", sessionId);
  
  
  ContactsInput *idList = [ContactsInput new];


//  UserIdList *idList = [UserIdList new];
  if (params[@"userIds"] != nil) {
    idList.userIdsArray = params[@"userIds"];
  }
  if(params[@"localContacts"] != nil){
    NSArray *localContactsArray = params[@"localContacts"];
    for (int i=0; i < [localContactsArray count]; i++) {
      NSDictionary *lContactsDict = localContactsArray[i];
      NSString *userName = lContactsDict[@"userName"];
      NSDictionary *emailAddressesDict = lContactsDict[@"emailAddresses"];
      NSDictionary *phoneNumbersDict = lContactsDict[@"phoneNumbers"];
      
      EmailAddresses *emailAddresses = [EmailAddresses new];
      emailAddresses.home = emailAddressesDict[@"home"];
      emailAddresses.work = emailAddressesDict[@"work"];

      PhoneNumbers *phoneNumbers = [PhoneNumbers new];
      phoneNumbers.satellite = phoneNumbersDict[@"satellite"];
      phoneNumbers.land = phoneNumbersDict[@"land"];
      phoneNumbers.mobile = phoneNumbersDict[@"mobile"];
      
      LocalContact *localContact = [LocalContact new];
      localContact.userName = userName;
      localContact.phoneNumbers = phoneNumbers;
      localContact.emailAddresses = emailAddresses;
      
      [idList.localContactsArray addObject:localContact];

    }
  }
  


  GRPCProtoCall *call = [self.serviceClient
                         RPCToAddWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(update, updateWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService  method:update Params : %@", sessionId);
  
  
  ContactsInput *idList = [ContactsInput new];
  
  
  //  UserIdList *idList = [UserIdList new];
  if (params[@"userIds"] != nil) {
    idList.userIdsArray = params[@"userIds"];
  }
  if(params[@"localContacts"] != nil){
    NSArray *localContactsArray = params[@"localContacts"];
    for (int i=0; i < [localContactsArray count]; i++) {
      NSDictionary *lContactsDict = localContactsArray[i];
      NSString *userName = lContactsDict[@"userName"];
      NSDictionary *emailAddressesDict = lContactsDict[@"emailAddresses"];
      NSDictionary *phoneNumbersDict = lContactsDict[@"phoneNumbers"];
      
      EmailAddresses *emailAddresses = [EmailAddresses new];
      emailAddresses.home = emailAddressesDict[@"home"];
      emailAddresses.work = emailAddressesDict[@"work"];
      
      PhoneNumbers *phoneNumbers = [PhoneNumbers new];
      phoneNumbers.satellite = phoneNumbersDict[@"satellite"];
      phoneNumbers.land = phoneNumbersDict[@"land"];
      phoneNumbers.mobile = phoneNumbersDict[@"mobile"];
      
      LocalContact *localContact = [LocalContact new];
      localContact.userName = userName;
      localContact.phoneNumbers = phoneNumbers;
      localContact.emailAddresses = emailAddresses;
      
      [idList.localContactsArray addObject:localContact];
      
    }
  }
  
  
  
  GRPCProtoCall *call = [self.serviceClient
                         RPCToUpdateWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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


RCT_REMAP_METHOD(accept, acceptWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:accept Params : %@", sessionId);

  
  ContactsInput *idList = [ContactsInput new];
  
  
  //  UserIdList *idList = [UserIdList new];
  if (params[@"userIds"] != nil) {
    idList.userIdsArray = params[@"userIds"];
  }
  if(params[@"localContacts"] != nil){
    NSArray *localContactsArray = params[@"localContacts"];
    for (int i=0; i < [localContactsArray count]; i++) {
      NSDictionary *lContactsDict = localContactsArray[i];
      NSString *userName = lContactsDict[@"userName"];
      NSDictionary *emailAddressesDict = lContactsDict[@"emailAddresses"];
      NSDictionary *phoneNumbersDict = lContactsDict[@"phoneNumbers"];
      
      EmailAddresses *emailAddresses = [EmailAddresses new];
      emailAddresses.home = emailAddressesDict[@"home"];
      emailAddresses.work = emailAddressesDict[@"work"];
      
      PhoneNumbers *phoneNumbers = [PhoneNumbers new];
      phoneNumbers.satellite = phoneNumbersDict[@"satellite"];
      phoneNumbers.land = phoneNumbersDict[@"land"];
      phoneNumbers.mobile = phoneNumbersDict[@"mobile"];
      
      LocalContact *localContact = [LocalContact new];
      localContact.userName = userName;
      localContact.phoneNumbers = phoneNumbers;
      localContact.emailAddresses = emailAddresses;
      
      [idList.localContactsArray addObject:localContact];
    }
  }
  


  GRPCProtoCall *call = [self.serviceClient
                         RPCToAcceptWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(remove, removeWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:remove Params : %@", sessionId);

  
  ContactsInput *idList = [ContactsInput new];
  
  
  //  UserIdList *idList = [UserIdList new];
  if (params[@"userIds"] != nil) {
    idList.userIdsArray = params[@"userIds"];
  }
  if(params[@"localContacts"] != nil){
    NSArray *localContactsArray = params[@"localContacts"];
    for (int i=0; i < [localContactsArray count]; i++) {
      NSDictionary *lContactsDict = localContactsArray[i];
      NSString *userId = lContactsDict[@"userId"];
      NSString *userName = lContactsDict[@"userName"];
      NSDictionary *emailAddressesDict = lContactsDict[@"emailAddresses"];
      NSDictionary *phoneNumbersDict = lContactsDict[@"phoneNumbers"];
      
      EmailAddresses *emailAddresses = [EmailAddresses new];
      emailAddresses.home = emailAddressesDict[@"home"];
      emailAddresses.work = emailAddressesDict[@"work"];
      
      PhoneNumbers *phoneNumbers = [PhoneNumbers new];
      phoneNumbers.satellite = phoneNumbersDict[@"satellite"];
      phoneNumbers.land = phoneNumbersDict[@"land"];
      phoneNumbers.mobile = phoneNumbersDict[@"mobile"];
      
      LocalContact *localContact = [LocalContact new];
      localContact.userName = userName;
      localContact.userId = userId;
      localContact.phoneNumbers = phoneNumbers;
      localContact.emailAddresses = emailAddresses;
      
      [idList.localContactsArray addObject:localContact];
    }
  }
  

  
  GRPCProtoCall *call = [self.serviceClient
                         RPCToRemoveWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(invite, inviteWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:invite Params : %@", sessionId);

  EmailIdList *emailIdsList = [EmailIdList new];
  emailIdsList.emailIdsArray = params[@"emailIds"];
  
  GRPCProtoCall *call = [self.serviceClient
                         RPCToInviteWithRequest:emailIdsList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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



@end
