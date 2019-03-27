package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.frontm.agentguard.proto.AgentGuardInput;
import com.frontm.agentguard.proto.AgentGuardServiceGrpc;
import com.frontm.agentguard.proto.AgentGuardStringResponse;
import com.frontm.agentguard.proto.Channel;
import com.frontm.agentguard.proto.Conversation;
import com.frontm.frontm.proto.converters.AgentGuardStringResponseConverter;
import com.squareup.okhttp.ConnectionSpec;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class AgentGuardServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public AgentGuardServiceClient(ReactApplicationContext reactContext) {
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
        return "AgentGuardServiceClient";
    }


    @ReactMethod
    public void execute(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::execute", sessionId);
        AgentGuardServiceGrpc.AgentGuardServiceStub stub = AgentGuardServiceGrpc.newStub(mChannel);

        AgentGuardInput.Builder builder = AgentGuardInput.newBuilder()
                .setParameters(params.getString("parameters"))
                .setCapability(params.getString("capability"))
                .setSync(params.getBoolean("sync"));

        if (params.hasKey("conversation")) {
            ReadableMap convDict = params.getMap("conversation");
            Conversation.Builder convBuilder = Conversation.newBuilder()
                    .setConversationId(convDict.getString("conversationId"))
                    .setBot(convDict.getString("bot"));

            if (convDict.hasKey("closed")) {
                convBuilder.setClosed(convDict.getBoolean("closed"));
            }


            if (convDict.hasKey("participants")) {
                ReadableArray participants = convDict.getArray("participants");
                for (int i = 0; i < participants.size(); ++i) {
                    convBuilder.addParticipants(participants.getString(i));
                }
            }


            if (convDict.hasKey("onChannels")) {
                ReadableArray onChannels = convDict.getArray("onChannels");
                for (int i = 0; i < onChannels.size(); ++i) {
                    ReadableMap channelDict = onChannels.getMap(i);
                    Channel channel = Channel.newBuilder()
                            .setChannelName(channelDict.getString("channelName"))
                            .setUserDomain(channelDict.getString("userDomain"))
                            .build();
                    convBuilder.addOnChannels(channel);
                }
            }

            builder.setConversation(convBuilder.build());
        }

        AgentGuardInput input = builder.build();

        Log.d("GRPC::::Agent Guard input", input.toString());

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.execute(input, new StreamObserver<AgentGuardStringResponse>() {
            @Override
            public void onNext(AgentGuardStringResponse value) {
                callback.invoke(null, new AgentGuardStringResponseConverter().toResponse(value));
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
