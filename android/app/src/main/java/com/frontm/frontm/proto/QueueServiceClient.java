package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.contacts.proto.EmailIdList;
import com.frontm.frontm.proto.converters.QueueMessageConverter;
import com.frontm.frontm.proto.converters.QueueResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeBotResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeDomainResponseConverter;
import com.frontm.frontm.proto.converters.TwilioTokenResponseConverter;
import com.frontm.frontm.proto.converters.VoipStatusResponseConverter;
import com.frontm.frontm.proto.converters.VoipToggleResponseConverter;
import com.frontm.queue.proto.QueueMessage;
import com.frontm.queue.proto.QueueResponse;
import com.frontm.queue.proto.QueueServiceGrpc;
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

import javax.annotation.Nullable;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class QueueServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public QueueServiceClient(ReactApplicationContext reactContext) {
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
        return "QueueServiceClient";
    }


    private void sendEvent(String eventName,
                           @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void getAllQueueMessages(String sessionId)
    {
        Log.d("GRPC:::getAllQMess", sessionId);
        QueueServiceGrpc.QueueServiceStub stub = QueueServiceGrpc.newStub(mChannel);

        Empty input = Empty.newBuilder().build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getAllQueueMessages(input, new StreamObserver<QueueResponse>() {
            @Override
            public void onNext(QueueResponse value) {
                //callback.invoke(null, new QueueResponseConverter().toResponse(value));
                sendEvent("message", new QueueResponseConverter().toResponse(value));
            }

            @Override
            public void onError(Throwable t) {
                //callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {
                sendEvent("end", null);
            }
        });

    }


    @ReactMethod
    public void startChatSSE(String sessionId)
    {
        Log.d("GRPC:::startChatSSE", sessionId);
        QueueServiceGrpc.QueueServiceStub stub = QueueServiceGrpc.newStub(mChannel);

        Empty input = Empty.newBuilder().build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getStreamingQueueMessage(input, new StreamObserver<QueueMessage>() {
            @Override
            public void onNext(QueueMessage value) {
                sendEvent("message", new QueueMessageConverter().toJson(value));
            }

            @Override
            public void onError(Throwable t) {
                //callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {
                sendEvent("end", null);
            }
        });

    }

}
