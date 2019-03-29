//
//  CompanyServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CompanyServiceClient.h"
#import "Companyservice.pbrpc.h"
#import "DomainRoles+frontm.h"
#import "CreateCompanyResponse+frontm.h"
#import <React/RCTLog.h>
#import "GRPCMetadata.h"

@interface CompanyServiceClient()

@property (strong, atomic) CompanyService *serviceClient;

@end

@implementation CompanyServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[CompanyService alloc] initWithHost:GRPCMetadata.shared.uri];
  }
  return self;
}



RCT_REMAP_METHOD(create, createWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  CreateCompanyInput *input = [CreateCompanyInput new];
  input.action = params[@"action"];
  input.companyId = params[@"companyId"];
  input.companyName = params[@"companyName"];
  input.companyDescription = params[@"companyDescription"];
  input.companyAddress = params[@"companyAddress"];
  input.companyCountry = params[@"companyCountry"];
  input.domainsArray = [[DomainRoles arrayOfDomainRolesfromArray:params[@"domains"]] mutableCopy];


  GRPCProtoCall *call = [self.serviceClient
                         RPCToCreateWithRequest:input handler:^(CreateCompanyResponse * _Nullable response, NSError * _Nullable error) {
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
