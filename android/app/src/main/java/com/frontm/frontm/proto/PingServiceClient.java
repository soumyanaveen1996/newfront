package com.frontm.frontm.proto;


import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.frontm.BuildConfig;
import com.frontm.ping.proto.PingReply;
import com.frontm.ping.proto.PingServiceGrpc;
import com.squareup.okhttp.ConnectionSpec;

import java.util.HashMap;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.MethodDescriptor;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class PingServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public PingServiceClient(ReactApplicationContext reactContext) {
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
        return "PingServiceClient";
    }

    @ReactMethod
    public void pingWithCallback(final Callback callback)
    {

        PingServiceGrpc.PingServiceStub stub = PingServiceGrpc.newStub(mChannel);
        com.frontm.commonmessages.proto.Empty request = com.frontm.commonmessages.proto.Empty.newBuilder().build();

        stub.ping(request, new StreamObserver<PingReply>() {
            @Override
            public void onNext(final PingReply value) {
                WritableMap response = Arguments.createMap();
                if (value.getMessage() != null){
                    response.putString("message", value.getMessage());
                    callback.invoke(null, response);
                } else {
                    response.putString("message", "No response from the server");
                    callback.invoke(null, response);
                }
            }

            @Override
            public void onError(Throwable t) {
                WritableMap response = Arguments.createMap();
                callback.invoke(response);
            }

            @Override
            public void onCompleted() {

            }
        });

    }
}
