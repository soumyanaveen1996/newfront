//
//  PhoneNumbers+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Commonmessages.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface PhoneNumbers (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSMutableArray *)numbers;

@end

NS_ASSUME_NONNULL_END
