#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Conversationservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class CatalogResponse;
@class Empty;
@class GetArchivedMessagesInput;
@class GetArchivedMessagesResponse;
@class GetConversationDetailsInput;
@class GetConversationDetailsResponse;
@class TimelineResponse;
@class UpdateFavouritesInput;
@class UpdateFavouritesResponse;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
  #import "Commonmessages.pbobjc.h"
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol ConversationService <NSObject>

#pragma mark UpdateFavourites(UpdateFavouritesInput) returns (UpdateFavouritesResponse)

- (void)updateFavouritesWithRequest:(UpdateFavouritesInput *)request handler:(void(^)(UpdateFavouritesResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUpdateFavouritesWithRequest:(UpdateFavouritesInput *)request handler:(void(^)(UpdateFavouritesResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetTimeline(Empty) returns (TimelineResponse)

- (void)getTimelineWithRequest:(Empty *)request handler:(void(^)(TimelineResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetTimelineWithRequest:(Empty *)request handler:(void(^)(TimelineResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetCatalog(Empty) returns (CatalogResponse)

- (void)getCatalogWithRequest:(Empty *)request handler:(void(^)(CatalogResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetCatalogWithRequest:(Empty *)request handler:(void(^)(CatalogResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetConversationDetails(GetConversationDetailsInput) returns (GetConversationDetailsResponse)

- (void)getConversationDetailsWithRequest:(GetConversationDetailsInput *)request handler:(void(^)(GetConversationDetailsResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetConversationDetailsWithRequest:(GetConversationDetailsInput *)request handler:(void(^)(GetConversationDetailsResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetArchivedMessages(GetArchivedMessagesInput) returns (GetArchivedMessagesResponse)

- (void)getArchivedMessagesWithRequest:(GetArchivedMessagesInput *)request handler:(void(^)(GetArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetArchivedMessagesWithRequest:(GetArchivedMessagesInput *)request handler:(void(^)(GetArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface ConversationService : GRPCProtoService<ConversationService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

