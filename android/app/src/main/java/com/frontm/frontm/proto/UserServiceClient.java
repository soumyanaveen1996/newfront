package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.frontm.auth.proto.AuthServiceGrpc;
import com.frontm.auth.proto.FrontmSigninInput;
import com.frontm.auth.proto.GoogleSigninInput;
import com.frontm.auth.proto.SigninResponse;
import com.frontm.auth.proto.SignupResponse;
import com.frontm.auth.proto.SignupUser;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.commonmessages.proto.PhoneNumbers;
import com.frontm.frontm.proto.converters.BotSubscriptionsResponseConverter;
import com.frontm.frontm.proto.converters.ContactsResponseConverter;
import com.frontm.frontm.proto.converters.SigninResponseConverter;
import com.frontm.frontm.proto.converters.SignupResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeBotResponseConverter;
import com.frontm.frontm.proto.converters.SubscribeDomainResponseConverter;
import com.frontm.frontm.proto.converters.TwilioTokenResponseConverter;
import com.frontm.frontm.proto.converters.UpdateUserProfileResponseConverter;
import com.frontm.frontm.proto.converters.UserConverter;
import com.frontm.frontm.proto.converters.VoipStatusResponseConverter;
import com.frontm.frontm.proto.converters.VoipToggleResponseConverter;
import com.frontm.user.proto.BotSubscriptionsResponse;
import com.frontm.user.proto.ContactsResponse;
import com.frontm.user.proto.SubscribeBotInput;
import com.frontm.user.proto.SubscribeBotResponse;
import com.frontm.user.proto.SubscribeDomainInput;
import com.frontm.user.proto.SubscribeDomainResponse;
import com.frontm.user.proto.TwilioTokenInput;
import com.frontm.user.proto.TwilioTokenResponse;
import com.frontm.user.proto.UpdateUserProfileResponse;
import com.frontm.user.proto.User;
import com.frontm.user.proto.UserOrBuilder;
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


public class UserServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public UserServiceClient(ReactApplicationContext reactContext) {
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
        return "UserServiceClient";
    }


    @ReactMethod
    public void getBotSubscriptions(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getBotSubscriptions", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getBotSubscriptions(Empty.newBuilder().build(), new StreamObserver<BotSubscriptionsResponse>() {
            @Override
            public void onNext(BotSubscriptionsResponse value) {
                callback.invoke(null, new BotSubscriptionsResponseConverter().toResponse(value));
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
    public void getContacts(String sessionId, final Callback callback)
    {
        Log.d("GRPC:::getContacts", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getContacts(Empty.newBuilder().build(), new StreamObserver<ContactsResponse>() {
            @Override
            public void onNext(ContactsResponse value) {
                callback.invoke(null, new ContactsResponseConverter().toResponse(value));
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
    public void updateUserProfile(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::updateUser", params.toString());
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        User.Builder builder = User.newBuilder()
                .setSearchable(params.getBoolean("searchable"))
                .setVisible(params.getBoolean("visible"))
                .setUserName(params.getString("userName"))
                .setEmailAddress(params.getString("emailAddress"));

        if (params.getMap("phoneNumbers") != null) {
            ReadableMap ph = params.getMap("phoneNumbers");
            PhoneNumbers.Builder numbersBuilder = PhoneNumbers.newBuilder();

            if (ph.hasKey("land")) {
                numbersBuilder.setLand(ph.getString("land"));
            }

            if (ph.hasKey("mobile")) {
                numbersBuilder.setMobile(ph.getString("mobile"));
            }

            if (ph.hasKey("satellite")) {
                numbersBuilder.setSatellite(ph.getString("satellite"));
            }
            builder.setPhoneNumbers(numbersBuilder.build());
        }

        User user = builder.build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.updateUserProfile(user, new StreamObserver<UpdateUserProfileResponse>() {
            @Override
            public void onNext(UpdateUserProfileResponse value) {
                callback.invoke(null, new UpdateUserProfileResponseConverter().toResponse(value));
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
    public void getUserDetails(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::getUserDetails", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        User user = User.newBuilder()
                .setUserId(params.getString("userId"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.getUserDetails(user, new StreamObserver<User>() {
            @Override
            public void onNext(User value) {
                callback.invoke(null, new UserConverter().toResponse(value));
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
    public void subscribeBot(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::subscribeBot", sessionId);
        UserServiceGrpc.UserServiceStub stub = UserServiceGrpc.newStub(mChannel);

        SubscribeBotInput input = SubscribeBotInput.newBuilder()
                .setBotId(params.getString("botId"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.subscribeBot(input, new StreamObserver<SubscribeBotResponse>() {
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
    public void unsubscribeBot(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::unsubscribeBot", sessionId);
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
        Log.d("GRPC:::subscribeDomain", sessionId);
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
        Log.d("GRPC:::getVOIPStatus", sessionId);
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
        Log.d("GRPC:::enableVOIP", sessionId);
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
        Log.d("GRPC:::disableVOIP", sessionId);
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
