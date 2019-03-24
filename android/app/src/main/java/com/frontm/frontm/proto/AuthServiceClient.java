package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.frontm.auth.proto.AuthServiceGrpc;
import com.frontm.auth.proto.FrontmSigninInput;
import com.frontm.auth.proto.GoogleSigninInput;
import com.frontm.auth.proto.SigninResponse;
import com.frontm.auth.proto.SignupResponse;
import com.frontm.auth.proto.SignupUser;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.frontm.proto.converters.SigninResponseConverter;
import com.frontm.frontm.proto.converters.SignupResponseConverter;
import com.squareup.okhttp.ConnectionSpec;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class AuthServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public AuthServiceClient(ReactApplicationContext reactContext) {
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
        return "AuthServiceClient";
    }


    @ReactMethod
    public void signup(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::signup", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        SignupUser user = SignupUser.newBuilder()
                .setEmail(params.getString("email"))
                .setUserName(params.getString("userName"))
                .setPassword(params.getString("password"))
                .build();

        stub.signup(user, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void confirmSignup(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::confirmSignup", params.toString());
        Log.d("GRPC:::confirmSignup", params.getString("confirmCode"));
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        SignupUser user = SignupUser.newBuilder()
                .setEmail(params.getString("email"))
                .setConfirmCode(params.getString("confirmCode"))
                .build();

        stub.confirmSignup(user, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                Log.d("GRPC:::confirmSignup", value.toString());
                Log.d("GRPC:::confirmSignup", new SignupResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void resendSignupCode(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::resendSignupCode", params.toString());
        Log.d("GRPC:::resendSignupCode", params.getString("confirmCode"));
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        SignupUser user = SignupUser.newBuilder()
                .setEmail(params.getString("email"))
                .build();

        stub.resendSignupConfirmCode(user, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                Log.d("GRPC:::confirmSignup", new SignupResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void resetPassword(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::resetPassword", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        SignupUser user = SignupUser.newBuilder()
                .setEmail(params.getString("email"))
                .build();

        stub.resetPassword(user, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                Log.d("GRPC:::resetPassword", new SignupResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void confirmPasswordReset(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::confirmPasswordReset", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        SignupUser user = SignupUser.newBuilder()
                .setEmail(params.getString("email"))
                .setVerificationCode(params.getString("verificationCode"))
                .setNewPassword(params.getString("newPassword"))
                .build();

        stub.confirmPasswordReset(user, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                Log.d("GRPC:::confirmPasswordReset", new SignupResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void changePassword(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::changePassword", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        SignupUser user = SignupUser.newBuilder()
                .setEmail(params.getString("email"))
                .setOldPassword(params.getString("oldPassword"))
                .setNewPassword(params.getString("newPassword"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);
        stub.confirmPasswordReset(user, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                Log.d("GRPC:::confirmPasswordReset", new SignupResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void deleteUser(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::deleteUser", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        Empty empty = Empty.newBuilder().build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.deleteUser(empty, new StreamObserver<SignupResponse>() {
            @Override
            public void onNext(SignupResponse value) {
                Log.d("GRPC:::confirmPasswordReset", new SignupResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SignupResponseConverter().toResponse(value));
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
    public void frontmSignin(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::frontmSignin", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        FrontmSigninInput input = FrontmSigninInput.newBuilder()
                .setEmail(params.getString("email"))
                .setPassword(params.getString("password"))
                .setPlatform("android")
                .build();

        stub.frontmSignin(input, new StreamObserver<SigninResponse>() {
            @Override
            public void onNext(SigninResponse value) {
                Log.d("GRPC:::frontmSignin", new SigninResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SigninResponseConverter().toResponse(value));
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
    public void googleSignin(ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::googleSignin", params.toString());
        AuthServiceGrpc.AuthServiceStub stub = AuthServiceGrpc.newStub(mChannel);
        GoogleSigninInput input = GoogleSigninInput.newBuilder()
                .setCode(params.getString("code"))
                .setPlatform("android")
                .build();

        stub.googleSignin(input, new StreamObserver<SigninResponse>() {
            @Override
            public void onNext(SigninResponse value) {
                Log.d("GRPC:::googleSignin", new SigninResponseConverter().toResponse(value).toString());
                callback.invoke(null, new SigninResponseConverter().toResponse(value));
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
