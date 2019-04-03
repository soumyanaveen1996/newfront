#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Conversationservice.pbrpc.h"
#import "Conversationservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation ConversationService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"conversation"
                 serviceName:@"ConversationService"];
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

#pragma mark UpdateFavourites(UpdateFavouritesInput) returns (UpdateFavouritesResponse)

- (void)updateFavouritesWithRequest:(UpdateFavouritesInput *)request handler:(void(^)(UpdateFavouritesResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUpdateFavouritesWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUpdateFavouritesWithRequest:(UpdateFavouritesInput *)request handler:(void(^)(UpdateFavouritesResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"UpdateFavourites"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[UpdateFavouritesResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetTimeline(TimeLineInput) returns (TimelineResponse)

- (void)getTimelineWithRequest:(TimeLineInput *)request handler:(void(^)(TimelineResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetTimelineWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetTimelineWithRequest:(TimeLineInput *)request handler:(void(^)(TimelineResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetTimeline"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[TimelineResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetCatalog(CatalogInput) returns (CatalogResponse)

- (void)getCatalogWithRequest:(CatalogInput *)request handler:(void(^)(CatalogResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetCatalogWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetCatalogWithRequest:(CatalogInput *)request handler:(void(^)(CatalogResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetCatalog"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[CatalogResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetConversationDetails(GetConversationDetailsInput) returns (GetConversationDetailsResponse)

- (void)getConversationDetailsWithRequest:(GetConversationDetailsInput *)request handler:(void(^)(GetConversationDetailsResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetConversationDetailsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetConversationDetailsWithRequest:(GetConversationDetailsInput *)request handler:(void(^)(GetConversationDetailsResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetConversationDetails"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[GetConversationDetailsResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetArchivedMessages(GetArchivedMessagesInput) returns (GetArchivedMessagesResponse)

- (void)getArchivedMessagesWithRequest:(GetArchivedMessagesInput *)request handler:(void(^)(GetArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetArchivedMessagesWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetArchivedMessagesWithRequest:(GetArchivedMessagesInput *)request handler:(void(^)(GetArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetArchivedMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[GetArchivedMessagesResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
