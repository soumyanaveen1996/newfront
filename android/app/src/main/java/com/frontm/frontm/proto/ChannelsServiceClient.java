package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.frontm.channels.proto.AddParticipantsInput;
import com.frontm.channels.proto.BooleanResponse;
import com.frontm.channels.proto.ChannelListResponse;
import com.frontm.channels.proto.ChannelsServiceGrpc;
import com.frontm.channels.proto.CreateChannelResponse;
import com.frontm.channels.proto.CreateEditInput;
import com.frontm.channels.proto.DomainChannels;
import com.frontm.channels.proto.InputChannel;
import com.frontm.channels.proto.SubUnsubInput;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.frontm.proto.converters.BooleanResponseConverter;
import com.frontm.frontm.proto.converters.ChannelListResponseConverter;
import com.frontm.frontm.proto.converters.CreateChannelResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeBotResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeDomainResponseConverter;
import com.frontm.frontm.proto.converters.TwilioTokenResponseConverter;
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

import java.util.ArrayList;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class ChannelsServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public ChannelsServiceClient(ReactApplicationContext reactContext) {
        super(reactContext);
        String host = "grpcdev.frontm.ai";
        int port = 50051;
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
        return "ChannelsServiceClient";
    }


    @ReactMethod
    public void getSubscribed(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getSubscribed", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getSubscribed(Empty.newBuilder().build(), new StreamObserver<ChannelListResponse>() {
            @Override
            public void onNext(ChannelListResponse value) {
                callback.invoke(null, new ChannelListResponseConverter().toResponse(value));
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
    public void getUnsubscribed(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getUnsubscribed", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getUnsubscribed(Empty.newBuilder().build(), new StreamObserver<ChannelListResponse>() {
            @Override
            public void onNext(ChannelListResponse value) {
                callback.invoke(null, new ChannelListResponseConverter().toResponse(value));
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
    public void getOwned(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getOwned", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getOwned(Empty.newBuilder().build(), new StreamObserver<ChannelListResponse>() {
            @Override
            public void onNext(ChannelListResponse value) {
                callback.invoke(null, new ChannelListResponseConverter().toResponse(value));
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
    public void subscribe(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::subscribe", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        SubUnsubInput.Builder input = SubUnsubInput.newBuilder();
        if (params.getArray("domainChannels") != null) {
            ReadableArray channelsArray = params.getArray("domainChannels");
            for (int i = 0; i < channelsArray.size(); ++i) {
                ReadableMap channelDict = channelsArray.getMap(i);
                DomainChannels.Builder dcBuilder = DomainChannels.newBuilder()
                        .setUserDomain(channelDict.getString("userDomain"));

                if (channelDict.getArray("channels") != null) {
                    ReadableArray cArray = channelDict.getArray("channels");
                    for (int j = 0; j < cArray.size(); ++j) {
                        dcBuilder.setChannels(j, cArray.getString(j));
                    }
                } else {
                    dcBuilder.addAllChannels(new ArrayList<String>());
                }
                input.setDomainChannels(i, dcBuilder.build());
            }
        }

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.subscribe(input.build(), new StreamObserver<BooleanResponse>() {
            @Override
            public void onNext(BooleanResponse value) {
                callback.invoke(null, new BooleanResponseConverter().toResponse(value));
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
    public void unsubscribe(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::unsubscribe", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        SubUnsubInput.Builder input = SubUnsubInput.newBuilder();
        if (params.getArray("domainChannels") != null) {
            ReadableArray channelsArray = params.getArray("domainChannels");
            for (int i = 0; i < channelsArray.size(); ++i) {
                ReadableMap channelDict = channelsArray.getMap(i);
                DomainChannels.Builder dcBuilder = DomainChannels.newBuilder()
                        .setUserDomain(channelDict.getString("userDomain"));

                if (channelDict.getArray("channels") != null) {
                    ReadableArray cArray = channelDict.getArray("channels");
                    for (int j = 0; j < cArray.size(); ++j) {
                        dcBuilder.setChannels(j, cArray.getString(j));
                    }
                } else {
                    dcBuilder.addAllChannels(new ArrayList<String>());
                }
                input.setDomainChannels(i, dcBuilder.build());
            }
        }

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.unsubscribe(input.build(), new StreamObserver<BooleanResponse>() {
            @Override
            public void onNext(BooleanResponse value) {
                callback.invoke(null, new BooleanResponseConverter().toResponse(value));
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
    public void addParticipants(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::unsubscribe", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        AddParticipantsInput.Builder input = AddParticipantsInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));

        if (params.getArray("newUserIds") != null) {
            ReadableArray userIds = params.getArray("newUserIds");
            for (int i = 0; i < userIds.size(); ++i) {
                input.setNewUserIds(i, userIds.getString(i));
            }
        }

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.addParticipants(input.build(), new StreamObserver<BooleanResponse>() {
            @Override
            public void onNext(BooleanResponse value) {
                callback.invoke(null, new BooleanResponseConverter().toResponse(value));
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
    public void create(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::create", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        InputChannel  channel = InputChannel.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"))
                .setDescription(params.getString("description"))
                .setChannelType(params.getString("channelType"))
                .setDiscoverable(params.getBoolean("discoverable"))
                .build();

        CreateEditInput input = CreateEditInput.newBuilder()
                .setChannel(channel)
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.create(input, new StreamObserver<CreateChannelResponse>() {
            @Override
            public void onNext(CreateChannelResponse value) {
                callback.invoke(null, new CreateChannelResponseConverter().toResponse(value));
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
    public void edit(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::edit", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        InputChannel  channel = InputChannel.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"))
                .setDescription(params.getString("description"))
                .setChannelType(params.getString("channelType"))
                .setDiscoverable(params.getBoolean("discoverable"))
                .build();

        CreateEditInput input = CreateEditInput.newBuilder()
                .setChannel(channel)
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.edit(input, new StreamObserver<BooleanResponse>() {
            @Override
            public void onNext(BooleanResponse value) {
                callback.invoke(null, new BooleanResponseConverter().toResponse(value));
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
