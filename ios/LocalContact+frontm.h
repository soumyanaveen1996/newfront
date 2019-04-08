//
//  LocalContact+frontm.h
//  frontm_mobile
//
//  Created by Sourav Chatterjee on 08/04/19.
//  Copyright © 2019 Facebook. All rights reserved.
//


#import "Commonmessages.pbobjc.h"


NS_ASSUME_NONNULL_BEGIN

@interface LocalContact (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)users;

@end

NS_ASSUME_NONNULL_END
