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
import com.frontm.agentguard.proto.Channel;
import com.frontm.agentguard.proto.Conversation;
import com.frontm.commonmessages.proto.DomainRoles;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.company.proto.CompanyServiceGrpc;
import com.frontm.company.proto.CreateCompanyInput;
import com.frontm.company.proto.CreateCompanyResponse;
import com.frontm.frontm.proto.converters.CreateCompanyResponseConverter;
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

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class CompanyServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public CompanyServiceClient(ReactApplicationContext reactContext) {
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
        return "CompanyServiceClient";
    }


    @ReactMethod
    public void create(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        CompanyServiceGrpc.CompanyServiceStub stub = CompanyServiceGrpc.newStub(mChannel);


        CreateCompanyInput.Builder builder = CreateCompanyInput.newBuilder()
                .setAction(params.getString("action"))
                .setCompanyId(params.getString("companyId"))
                .setCompanyName(params.getString("companyName"))
                .setCompanyDescription(params.getString("companyDescription"))
                .setCompanyAddress(params.getString("companyAddress"))
                .setCompanyCountry(params.getString("companyCountry"));


        if (params.getMap("domains") != null) {
            ReadableArray domainsArray = params.getArray("domains");
            for (int i = 0; i < domainsArray.size(); ++i) {
                ReadableMap domainDict = domainsArray.getMap(i);

                DomainRoles.Builder domainBuilder = DomainRoles.newBuilder();
                domainBuilder.setDomain(domainDict.getString("domain"));

                ReadableArray rolesArray = domainDict.getArray("roles");
                for (int j = 0; j < rolesArray.size(); ++j) {
                    domainBuilder.setRoles(j, rolesArray.getString(j));
                }

                builder.setDomains(i, domainBuilder.build());
            }
        }


        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.create(builder.build(), new StreamObserver<CreateCompanyResponse>() {
            @Override
            public void onNext(CreateCompanyResponse value) {
                callback.invoke(null, new CreateCompanyResponseConverter().toResponse(value));
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
    public void unsubscribeBot(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        SubscribeBotInput input = SubscribeBotInput.newBuilder()
                .setBotId(params.getString("botId"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.unsubscribeBot(input, new StreamObserver<SubscribeBotResponse>() {
            @Override
            public void onNext(SubscribeBotResponse value) {
                callback.invoke(null, new SubscribeBotResponseConverter().toResponse(value));
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
    public void subscribeDomain(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        SubscribeDomainInput input = SubscribeDomainInput.newBuilder()
                .setVerificationCode(params.getString("verificationCode"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.subscribeDomain(input, new StreamObserver<SubscribeDomainResponse>() {
            @Override
            public void onNext(SubscribeDomainResponse value) {
                callback.invoke(null, new SubscribeDomainResponseConverter().toResponse(value));
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
    public void getVOIPStatus(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        VoipStatusInput input = VoipStatusInput.newBuilder().setUserId(params.getString("userId")).build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getVoipStatus(input, new StreamObserver<VoipStatusResponse>() {
            @Override
            public void onNext(VoipStatusResponse value) {
                callback.invoke(null, new VoipStatusResponseConverter().toResponse(value));
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
    public void enableVOIP(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.enableVoip(Empty.newBuilder().build(), new StreamObserver<VoipToggleResponse>() {
            @Override
            public void onNext(VoipToggleResponse value) {
                callback.invoke(null, new VoipToggleResponseConverter().toResponse(value));
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
    public void disableVOIP(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.disableVoip(Empty.newBuilder().build(), new StreamObserver<VoipToggleResponse>() {
            @Override
            public void onNext(VoipToggleResponse value) {
                callback.invoke(null, new VoipToggleResponseConverter().toResponse(value));
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
    public void generateTwilioToken(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::generateTwilioTo", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);
        TwilioTokenInput input = TwilioTokenInput.newBuilder()
                .setPlatform("android")
                .setEnv(params.getString("env"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.generateTwilioToken(input, new StreamObserver<TwilioTokenResponse>() {
            @Override
            public void onNext(TwilioTokenResponse value) {
                callback.invoke(null, new TwilioTokenResponseConverter().toResponse(value));
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
