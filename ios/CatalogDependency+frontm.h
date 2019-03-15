//
//  CatalogDependency+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Conversationservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface CatalogDependency (frontm)

- (NSDictionary *) toJSON;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)catalogBotClients;

@end

NS_ASSUME_NONNULL_END
