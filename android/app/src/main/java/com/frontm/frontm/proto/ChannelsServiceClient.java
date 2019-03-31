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
import com.frontm.channels.proto.UpdateUsersInput;
import com.frontm.channels.proto.AuthorizeParticipantInput;
import com.frontm.channels.proto.ChangeOwnerInput;
import com.frontm.channels.proto.ChannelDomainInput;
import com.frontm.channels.proto.BooleanResponse;
import com.frontm.channels.proto.ChannelListResponse;
import com.frontm.channels.proto.ChannelsServiceGrpc;
import com.frontm.channels.proto.CreateChannelResponse;
import com.frontm.channels.proto.CreateEditInput;
import com.frontm.channels.proto.DomainChannels;
import com.frontm.channels.proto.InputChannel;
import com.frontm.channels.proto.ParticipantsListResponse;
import com.frontm.channels.proto.SubUnsubInput;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.frontm.BuildConfig;
import com.frontm.frontm.proto.converters.BooleanResponseConverter;
import com.frontm.frontm.proto.converters.ChannelListResponseConverter;
import com.frontm.frontm.proto.converters.CreateChannelResponseConverter;
import com.frontm.frontm.proto.converters.ParticipantsListResponseConverter;
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
        Log.d("GRPC:::subscribe", params.toString());
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        SubUnsubInput.Builder input = SubUnsubInput.newBuilder();
        if (params.hasKey("domainChannels") && params.getArray("domainChannels") != null) {
            ReadableArray channelsArray = params.getArray("domainChannels");
            for (int i = 0; i < channelsArray.size(); ++i) {
                ReadableMap channelDict = channelsArray.getMap(i);
                DomainChannels.Builder dcBuilder = DomainChannels.newBuilder()
                        .setUserDomain(channelDict.getString("userDomain"));

                if (channelDict.hasKey("channels") && channelDict.getArray("channels") != null) {
                    ReadableArray cArray = channelDict.getArray("channels");
                    for (int j = 0; j < cArray.size(); ++j) {
                        dcBuilder.addChannels(cArray.getString(j));
                    }
                } else {
                    dcBuilder.addAllChannels(new ArrayList<String>());
                }
                input.addDomainChannels(dcBuilder.build());
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
        if (params.hasKey("domainChannels") && params.getArray("domainChannels") != null) {
            ReadableArray channelsArray = params.getArray("domainChannels");
            for (int i = 0; i < channelsArray.size(); ++i) {
                ReadableMap channelDict = channelsArray.getMap(i);
                DomainChannels.Builder dcBuilder = DomainChannels.newBuilder()
                        .setUserDomain(channelDict.getString("userDomain"));

                if (channelDict.hasKey("domainChannels") && channelDict.getArray("channels") != null) {
                    ReadableArray cArray = channelDict.getArray("channels");
                    for (int j = 0; j < cArray.size(); ++j) {
                        dcBuilder.addChannels(cArray.getString(j));
                    }
                } else {
                    dcBuilder.addAllChannels(new ArrayList<String>());
                }
                input.addDomainChannels(dcBuilder.build());
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

        if (params.hasKey("newUserIds") && params.getArray("newUserIds") != null) {
            ReadableArray userIds = params.getArray("newUserIds");
            for (int i = 0; i < userIds.size(); ++i) {
                input.addNewUserIds(userIds.getString(i));
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
                .setDiscoverable(params.getString("discoverable"))
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
    public void edit(String sessionId, ReadableMap params, final Callback callback) {
        Log.d("GRPC:::edit", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        InputChannel channel = InputChannel.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"))
                .setDescription(params.getString("description"))
                .setChannelType(params.getString("channelType"))
                .setDiscoverable(params.getString("discoverable"))
                .build();

        CreateEditInput input = CreateEditInput.newBuilder()
                .setChannel(channel)
                .build();

        Metadata header = new Metadata();
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

    @ReactMethod
    public void getParticipants(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::getParticipants", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        ChannelDomainInput.Builder input = ChannelDomainInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));


        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getParticipants(input.build(), new StreamObserver<ParticipantsListResponse>() {

            @Override
            public void onNext(ParticipantsListResponse value) {
                callback.invoke(null, new ParticipantsListResponseConverter().toResponse(value));
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
    public void getPendingParticipants(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::getPendingParticipants", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        ChannelDomainInput.Builder input = ChannelDomainInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));


        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getParticipants(input.build(), new StreamObserver<ParticipantsListResponse>() {

            @Override
            public void onNext(ParticipantsListResponse value) {
                callback.invoke(null, new ParticipantsListResponseConverter().toResponse(value));
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
    public void updateParticipants(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::UpdateParticipants", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        UpdateUsersInput.Builder input = UpdateUsersInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));

        if (params.hasKey("userIds") && params.getArray("userIds") != null) {
            ReadableArray userIds = params.getArray("userIds");
            for (int i = 0; i < userIds.size(); ++i) {
                input.addUserIds(userIds.getString(i));
            }
        }

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.updateParticipants(input.build(), new StreamObserver<BooleanResponse>() {
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
    public void requestPrivateChannelAccess(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::requestPrivateChannelAccess", params.toString());
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        ChannelDomainInput.Builder input = ChannelDomainInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));


        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.requestPrivateChannelAccess(input.build(), new StreamObserver<BooleanResponse>() {
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
    public void authorizeParticipants(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::authorizeParticipants", params.toString());
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        AuthorizeParticipantInput.Builder input = AuthorizeParticipantInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));



        if (params.hasKey("accepted") && params.getArray("accepted") != null) {
            ReadableArray acceptedParticipants = params.getArray("accepted");
            for (int i = 0; i < acceptedParticipants.size(); ++i) {
                input.addAccepted(acceptedParticipants.getString(i));
            }
        }

        if (params.hasKey("ignored") && params.getArray("ignored") != null) {
            ReadableArray ignoredParticipants = params.getArray("ignored");
            for (int i = 0; i < ignoredParticipants.size(); ++i) {
                input.addIgnored(ignoredParticipants.getString(i));
            }
        }



        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.authorizeParticipants(input.build(), new StreamObserver<BooleanResponse>() {
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
    public void changeOwner(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::changeOwner", params.toString());
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        ChangeOwnerInput.Builder input = ChangeOwnerInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"))
                .setNewOwnerId(params.getString("newOwnerId"));


        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.changeOwner(input.build(), new StreamObserver<BooleanResponse>() {
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
    public void getChannelAdmins(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC :::getChannelAdmins", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        ChannelDomainInput.Builder input = ChannelDomainInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));



        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getChannelAdmins(input.build(), new StreamObserver<ParticipantsListResponse>() {

            @Override
            public void onNext(ParticipantsListResponse value) {
                callback.invoke(null, new ParticipantsListResponseConverter().toResponse(value));
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
    public void updateChannelAdmins(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::UpdateChannelAdmins", sessionId);
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);


        UpdateUsersInput.Builder input = UpdateUsersInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));

        if (params.hasKey("userIds") && params.getArray("userIds") != null) {
            ReadableArray userIds = params.getArray("admins");
            for (int i = 0; i < userIds.size(); ++i) {
                input.addUserIds(userIds.getString(i));
            }
        }

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.updateChannelAdmins(input.build(), new StreamObserver<BooleanResponse>() {
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
    public void deleteChannel(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::requestPrivateChannelAccess", params.toString());
        ChannelsServiceGrpc.ChannelsServiceStub stub = ChannelsServiceGrpc.newStub(mChannel);

        ChannelDomainInput.Builder input = ChannelDomainInput.newBuilder()
                .setChannelName(params.getString("channelName"))
                .setUserDomain(params.getString("userDomain"));


        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.deleteChannel(input.build(), new StreamObserver<BooleanResponse>() {
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
