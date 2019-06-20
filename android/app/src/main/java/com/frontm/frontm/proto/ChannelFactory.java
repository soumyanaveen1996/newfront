package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.frontm.frontm.BuildConfig;
import com.squareup.okhttp.ConnectionSpec;

import io.grpc.ManagedChannel;
import io.grpc.okhttp.OkHttpChannelBuilder;

public class ChannelFactory extends ReactContextBaseJavaModule {
    private ManagedChannel mChannel;

    private Boolean mIsAlreadyListening = false;

    public ChannelFactory(ReactApplicationContext reactContext) {
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

    public Boolean getmIsAlreadyListening() {
        return mIsAlreadyListening;
    }

    public void setmIsAlreadyListening(Boolean mIsAlreadyListening) {
        this.mIsAlreadyListening = mIsAlreadyListening;
    }

    public ManagedChannel getmChannel() {
        if (mChannel == null) {
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
        return mChannel;
    }

    public void setmChannel(ManagedChannel mChannel) {
        this.mChannel = mChannel;
    }

    public void handleError() {
        if(mChannel == null){
            return;
        }
        mChannel.shutdown();
        mChannel = null;
        setmIsAlreadyListening(false);
        Log.d("GRPC::: sse", "Retry Connecting to GRPC Server");
    }

    @Override
    public String getName(){
        return "ChannelFactoryService";
    }
}
