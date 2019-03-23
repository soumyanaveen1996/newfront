package com.frontm.frontm.proto;


import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.frontm.ping.proto.PingReply;
import com.frontm.ping.proto.PingServiceGrpc;
import com.squareup.okhttp.ConnectionSpec;


import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;

import io.grpc.ManagedChannel;
import io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.NettyChannelBuilder;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.StreamObserver;
import io.netty.handler.ssl.SslContext;


public class PingServiceClient extends ReactContextBaseJavaModule {

    public PingServiceClient(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PingServiceClient";
    }



    @ReactMethod
    public void pingWithCallback(final Callback callback) throws javax.net.ssl.SSLException, java.io.IOException,
            java.security.KeyStoreException, java.security.cert.CertificateException, java.security.NoSuchAlgorithmException,
            java.security.KeyManagementException
    {
        Log.d("GRPC", "Amal ");

        String host = "grpcdev.frontm.ai";
        int port = 50051;

        /*
        InputStream stream = getReactApplicationContext().getAssets().open("sectigoSHA2.ca-bundle");
        //InputStreamReader reader = new InputStreamReader(stream);
        //BufferedReader reader1 = new BufferedReader(reader);
        //Log.d("GRPC", "Amal " + reader1.readLine());

        SslContext sslContext = GrpcSslContexts.forClient().trustManager(stream).build();

        ManagedChannel channel = NettyChannelBuilder.forAddress("grpcdev.frontm.ai", 50051).sslContext(sslContext).build();


        //OkHttpChannelBuilder builder = OkHttpChannelBuilder.forAddress(host, port).sslSocketFactory(TestUtils.newSslSocketFactoryForCa(Platform.get().getProvider(),
        //        TestUtils.loadCert("ca.pem"))) */

        KeyStore trust_store = KeyStore.getInstance(KeyStore.getDefaultType());
        trust_store.load(null);

        InputStream input_stream = getReactApplicationContext().getAssets().open("sectigoSHA2.ca-bundle");

        CertificateFactory cert_factory = CertificateFactory.getInstance("X.509");
        Certificate cert = cert_factory.generateCertificate(input_stream);
        trust_store.setCertificateEntry("cert", cert);

        TrustManagerFactory trust_manager_factory = TrustManagerFactory.getInstance(
                TrustManagerFactory.getDefaultAlgorithm());
        trust_manager_factory.init(trust_store);
        TrustManager[] trust_manager = trust_manager_factory.getTrustManagers();

        SSLContext tlsContext = SSLContext.getInstance("TLSv1.2");
        tlsContext.init(null, trust_manager, null);


        ManagedChannel channel = OkHttpChannelBuilder.forAddress(host, port)
                .connectionSpec(ConnectionSpec.MODERN_TLS)
                .sslSocketFactory(tlsContext.getSocketFactory())
                .build();

        PingServiceGrpc.PingServiceStub stub = PingServiceGrpc.newStub(channel);
        com.frontm.commonmessages.proto.Empty request = com.frontm.commonmessages.proto.Empty.newBuilder().build();


        stub.ping(request, new StreamObserver<PingReply>() {
            @Override
            public void onNext(PingReply value) {

                if (value.getMessage() != null){
                    callback.invoke(null, value.getMessage());
                } else {
                    callback.invoke(null, "No Response from the server");
                }
            }

            @Override
            public void onError(Throwable t) {
                callback.invoke("error");
            }

            @Override
            public void onCompleted() {

            }
        });

    }
}
