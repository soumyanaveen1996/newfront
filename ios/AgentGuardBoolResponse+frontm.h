//
//  AgentGuardBoolResponse+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Contactsservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface AgentGuardBoolResponse (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;

@end

NS_ASSUME_NONNULL_END