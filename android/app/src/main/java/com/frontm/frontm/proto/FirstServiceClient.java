package com.frontm.frontm.proto;

import android.support.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;


import io.grpc.stub.StreamObserver;


public class FirstServiceClient extends ReactContextBaseJavaModule {

    public FirstServiceClient(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "FirstServiceClient";
    }

    @ReactMethod
    public void sayHello(String name, final Callback callback) {
        FirstServiceGrpc.FirstServiceStub stub = FirstServiceGrpc.newStub(null);
        HelloRequest request = HelloRequest.newBuilder().setName("Frontm GRPC").build();
        stub.sayHello(request, new StreamObserver<HelloReply>() {
            @Override
            public void onNext(HelloReply value) {
                callback.invoke(null, value.getMessage());
            }

            @Override
            public void onError(Throwable t) {

            }

            @Override
            public void onCompleted() {

            }
        });

    }
}
