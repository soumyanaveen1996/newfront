package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.conversation.proto.CatalogResponse;
import com.frontm.conversation.proto.ConversationServiceGrpc;
import com.frontm.conversation.proto.GetArchivedMessagesContent;
import com.frontm.conversation.proto.GetArchivedMessagesInput;
import com.frontm.conversation.proto.GetArchivedMessagesResponse;
import com.frontm.conversation.proto.GetConversationDetailsInput;
import com.frontm.conversation.proto.GetConversationDetailsResponse;
import com.frontm.conversation.proto.TimelineResponse;
import com.frontm.conversation.proto.UpdateFavouritesInput;
import com.frontm.conversation.proto.UpdateFavouritesResponse;
import com.frontm.frontm.BuildConfig;
import com.frontm.frontm.proto.converters.CatalogResponseConverter;
import com.frontm.frontm.proto.converters.GetArchivedMessagesResponseConverter;
import com.frontm.frontm.proto.converters.GetConversationDetailsResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeBotResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeDomainResponseConverter;
import com.frontm.frontm.proto.converters.TimelineResponseConverter;
import com.frontm.frontm.proto.converters.TwilioTokenResponseConverter;
import com.frontm.frontm.proto.converters.UpdateFavouritesResponseConverter;
import com.frontm.frontm.proto.converters.VoipStatusResponseConverter;
import com.frontm.frontm.proto.converters.VoipToggleResponseConverter;
import com.frontm.user.proto.SubscribeBotInput;
import com.frontm.user.proto.SubscribeBotResponse;
import com.frontm.user.proto.SubscribeDomainInput;
import com.frontm.user.proto.SubscribeDomainResponse;
import com.frontm.user.proto.TwilioTokenInput;
import com.frontm.user.proto.TwilioTokenResponse;
import com.frontm.user.proto.UserServiceGrpc;
import com.frontm.user.proto.VoipStatusInput;
import com.frontm.user.proto.VoipStatusResponse;
import com.frontm.user.proto.VoipToggleResponse;
import com.squareup.okhttp.ConnectionSpec;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class ConversationServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public ConversationServiceClient(ReactApplicationContext reactContext) {
        super(reactContext);
        String host = BuildConfig.GRPC_HOST;
        int port = BuildConfig.GRPC_PORT;
        try {
            mChannel = OkHttpChannelBuilder.forAddress(host, port)
                    .connectionSpec(ConnectionSpec.MODERN_TLS)
                    .sslSocketFactory(TLSContext.shared(getReactApplicationContext()).getSocketFactory())
                    .build();
        } catch (Exception e) {
            mChannel = null;
        }
    }

    @Override
    public String getName() {
        return "ConversationServiceClient";
    }


    @ReactMethod
    public void getCatalog(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getCatalog", sessionId);
        ConversationServiceGrpc.ConversationServiceStub stub = ConversationServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getCatalog(Empty.newBuilder().build(), new StreamObserver<CatalogResponse>() {
            @Override
            public void onNext(CatalogResponse value) {
                callback.invoke(null, new CatalogResponseConverter().toResponse(value));
            }

            @Override
            public void onError(Throwable t) {
                callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {

            }
        });

    }


    @ReactMethod
    public void getConversationDetails(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::getConversationDetails", sessionId);
        ConversationServiceGrpc.ConversationServiceStub stub = ConversationServiceGrpc.newStub(mChannel);

        GetConversationDetailsInput input = GetConversationDetailsInput.newBuilder()
                .setConversationId(params.getString("conversationId"))
                .setBotId(params.getString("botId"))
                .setCreatedBy(params.getString("createdBy"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getConversationDetails(input, new StreamObserver<GetConversationDetailsResponse>() {
            @Override
            public void onNext(GetConversationDetailsResponse value) {
                callback.invoke(null, new GetConversationDetailsResponseConverter().toResponse(value));
            }

            @Override
            public void onError(Throwable t) {
                callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {

            }
        });

    }


    @ReactMethod
    public void updateFavorites(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::updateFavorites", sessionId);
        ConversationServiceGrpc.ConversationServiceStub stub = ConversationServiceGrpc.newStub(mChannel);

        UpdateFavouritesInput.Builder inputBuilder = UpdateFavouritesInput.newBuilder()
                .setAction(params.getString("action"));

        if (params.hasKey("conversationId")) {
            inputBuilder.setConversationId(params.getString("conversationId"));
        }

        if (params.hasKey("botId")) {
            inputBuilder.setBotId(params.getString("botId"));
        }

        if (params.hasKey("userId")) {
            inputBuilder.setUserId(params.getString("userId"));
        }

        if (params.hasKey("channelName")) {
            inputBuilder.setChannelName(params.getString("channelName"));

        }

        if (params.hasKey("userDomain")) {
            inputBuilder.setUserDomain(params.getString("userDomain"));
        }

        UpdateFavouritesInput input = inputBuilder.build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.updateFavourites(input, new StreamObserver<UpdateFavouritesResponse>() {
            @Override
            public void onNext(UpdateFavouritesResponse value) {
                callback.invoke(null, new UpdateFavouritesResponseConverter().toResponse(value));
            }

            @Override
            public void onError(Throwable t) {
                callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {

            }
        });

    }

    @ReactMethod
    public void getTimeline(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getTimeline", sessionId);
        ConversationServiceGrpc.ConversationServiceStub stub = ConversationServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getTimeline(Empty.newBuilder().build(), new StreamObserver<TimelineResponse>() {
            @Override
            public void onNext(TimelineResponse value) {
                callback.invoke(null, new TimelineResponseConverter().toResponse(value));
            }

            @Override
            public void onError(Throwable t) {
                callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {

            }
        });

    }

    @ReactMethod
    public void getArchivedMessages(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::getArchivedMessages", sessionId);
        ConversationServiceGrpc.ConversationServiceStub stub = ConversationServiceGrpc.newStub(mChannel);


        GetArchivedMessagesInput input = GetArchivedMessagesInput.newBuilder()
                .setConversationId(params.getString("conversationId"))
                .setBotId(params.getString("botId"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getArchivedMessages(input, new StreamObserver<GetArchivedMessagesResponse>() {
            @Override
            public void onNext(GetArchivedMessagesResponse value) {
                callback.invoke(null, new GetArchivedMessagesResponseConverter().toResponse(value));
            }

            @Override
            public void onError(Throwable t) {
                callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {

            }
        });

    }


}
