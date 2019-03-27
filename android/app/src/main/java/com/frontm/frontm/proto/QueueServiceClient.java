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

import java.util.concurrent.TimeUnit;

import javax.annotation.Nullable;

import io.grpc.Context;
import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class QueueServiceClient extends ReactContextBaseJavaModule {



    private ManagedChannel mChannel;
    private Boolean mIsAlreadyListening = false;
    private String mSessionId;

    public Boolean getmIsAlreadyListening() {
        return mIsAlreadyListening;
    }

    public void setmIsAlreadyListening(Boolean mIsAlreadyListening) {
        this.mIsAlreadyListening = mIsAlreadyListening;
    }



    public String getmSessionId() {
        return mSessionId;
    }

    public void setmSessionId(String mSessionId) {
        this.mSessionId = mSessionId;
    }


    public ManagedChannel getmChannel() {
        if (mChannel == null) {
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
        return mChannel;
    }

    public void setmChannel(ManagedChannel mChannel) {
        this.mChannel = mChannel;
    }



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
        QueueServiceGrpc.QueueServiceStub stub = QueueServiceGrpc.newStub(getmChannel());

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
                Log.d("GRPC:::read queue message", value.toString());
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

    public void handleError() {
        mChannel.shutdown();
        mChannel = null;
        setmIsAlreadyListening(false);
        startChatSSE(getmSessionId());

    }

    @ReactMethod
    public void startChatSSE(String sessionId)
    {
        if (getmIsAlreadyListening() && getmSessionId() != null && getmSessionId().equals(sessionId)) {
            return;
        }

        if (getmSessionId() != null && !getmSessionId().equals(sessionId)) {
            if (mChannel != null) {
                mChannel.shutdown();
                mChannel = null;
            }
        }

        setmIsAlreadyListening(true);
        setmSessionId(sessionId);

        Log.d("GRPC:::SSE", "startChatSSE" + sessionId);
        QueueServiceGrpc.QueueServiceStub stub = QueueServiceGrpc.newStub(getmChannel());

        Empty input = Empty.newBuilder().build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getStreamingQueueMessage(input, new StreamObserver<QueueMessage>() {
            @Override
            public void onNext(QueueMessage value) {
                Log.d("GRPC:::SSE message", value.toString());
                sendEvent("sse_message", new QueueMessageConverter().toJson(value));
            }

            @Override
            public void onError(Throwable t) {
                Log.d("GRPC:::SSE error", t.getStackTrace().toString());
                handleError();
                sendEvent("sse_error", null);
                //callback.invoke(Arguments.createMap());
            }

            @Override
            public void onCompleted() {
                Log.d("GRPC:::SSE completed", "completed");
                sendEvent("sse_end", null);
            }
        });

    }

}
