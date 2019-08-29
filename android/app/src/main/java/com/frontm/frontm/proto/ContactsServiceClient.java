package com.frontm.frontm.proto;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import com.frontm.commonmessages.proto.EmailAddresses;
import com.frontm.commonmessages.proto.Empty;
import com.frontm.commonmessages.proto.LocalContact;
import com.frontm.commonmessages.proto.PhoneNumbers;
import com.frontm.contacts.proto.AgentGuardBoolResponse;
import com.frontm.contacts.proto.ContactsInput;
import com.frontm.contacts.proto.ContactsServiceGrpc;
import com.frontm.contacts.proto.EmailIdList;
import com.frontm.contacts.proto.FindResponse;
import com.frontm.contacts.proto.SearchQuery;
import com.frontm.frontm.BuildConfig;
import com.frontm.frontm.proto.converters.AgentGuardBoolResponseConverter;
import com.frontm.frontm.proto.converters.FindResponseConverter;
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

import java.util.concurrent.TimeUnit;

import io.grpc.ManagedChannel;
import io.grpc.Metadata;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;


public class ContactsServiceClient extends ReactContextBaseJavaModule {

    private ManagedChannel mChannel;

    public ContactsServiceClient(ReactApplicationContext reactContext) {
        super(reactContext);
        String host = BuildConfig.GRPC_HOST;
        int port = BuildConfig.GRPC_PORT;
        try {
            mChannel = OkHttpChannelBuilder.forAddress(host, port)
                    .keepAliveTime(30000, TimeUnit.MILLISECONDS)
                    .keepAliveTimeout(5000, TimeUnit.MILLISECONDS)
                    .keepAliveWithoutCalls(true)
                    .connectionSpec(ConnectionSpec.MODERN_TLS)
                    .sslSocketFactory(TLSContext.shared(getReactApplicationContext()).getSocketFactory())
                    .build();
        } catch (Exception e) {
            mChannel = null;
        }
    }

    @Override
    public String getName() {
        return "ContactsServiceClient";
    }


    @ReactMethod
    public void find(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::find", sessionId);
        ContactsServiceGrpc.ContactsServiceStub stub = ContactsServiceGrpc.newStub(mChannel);

        SearchQuery input = SearchQuery.newBuilder()
                .setQueryString(params.getString("queryString"))
                .build();

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.find(input, new StreamObserver<FindResponse>() {
            @Override
            public void onNext(FindResponse value) {
                callback.invoke(null, new FindResponseConverter().toResponse(value));
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
    public void add(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::add", sessionId);
        ContactsServiceGrpc.ContactsServiceStub stub = ContactsServiceGrpc.newStub(mChannel);

        ContactsInput.Builder input = ContactsInput.newBuilder();
        if (params.hasKey("userIds")) {
            ReadableArray userIds = params.getArray("userIds");
            for(int i = 0; i < userIds.size(); ++i) {
                input.addUserIds(userIds.getString(i));
            }
        }

        if (params.hasKey("localContacts")) {

            ReadableArray localContacts = params.getArray("localContacts");
            for (int i = 0; i < localContacts.size(); ++i) {

                ReadableMap lContactDict = localContacts.getMap(i);
                String userName = lContactDict.getString("userName");
                ReadableMap emailAddressesDict = lContactDict.getMap("emailAddresses");
                ReadableMap phoneNumbersDict = lContactDict.getMap("phoneNumbers");

                EmailAddresses emailAddresses = EmailAddresses.newBuilder().
                        setHome(emailAddressesDict.hasKey("home") ? emailAddressesDict.getString("home") : "").
                        setWork(emailAddressesDict.hasKey("work") ? emailAddressesDict.getString("work") : "").build();


                PhoneNumbers phoneNumbers = PhoneNumbers.newBuilder().
                        setLand(phoneNumbersDict.hasKey("land") ? phoneNumbersDict.getString("land") : "").
                        setMobile(phoneNumbersDict.hasKey("mobile") ? phoneNumbersDict.getString("mobile") : "").
                        setSatellite(phoneNumbersDict.hasKey("satellite") ? phoneNumbersDict.getString("satellite") : "").build();

                LocalContact localContact = LocalContact.newBuilder().setUserName(userName)
                        .setEmailAddresses(emailAddresses)
                        .setPhoneNumbers(phoneNumbers).build();
                input.addLocalContacts(localContact);

            }
        }



        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.add(input.build(), new StreamObserver<AgentGuardBoolResponse>() {
            @Override
            public void onNext(AgentGuardBoolResponse value) {
                callback.invoke(null, new AgentGuardBoolResponseConverter().toResponse(value));
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
    public void accept(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::accept", sessionId);
        ContactsServiceGrpc.ContactsServiceStub stub = ContactsServiceGrpc.newStub(mChannel);

        ContactsInput.Builder input = ContactsInput.newBuilder();
        if (params.getArray("userIds") != null) {
            ReadableArray userIds = params.getArray("userIds");
            for(int i = 0; i < userIds.size(); ++i) {
                input.addUserIds(userIds.getString(i));
            }
        }

        if (params.hasKey("localContacts")) {

            ReadableArray localContacts = params.getArray("localContacts");
            for (int i = 0; i < localContacts.size(); ++i) {

                ReadableMap lContactDict = localContacts.getMap(i);
                String userName = lContactDict.getString("userName");
                ReadableMap emailAddressesDict = lContactDict.getMap("emailAddresses");
                ReadableMap phoneNumbersDict = lContactDict.getMap("phoneNumbers");

                EmailAddresses emailAddresses = EmailAddresses.newBuilder().
                        setHome(emailAddressesDict.getString("home")).
                        setWork(emailAddressesDict.getString("work")).build();

                PhoneNumbers phoneNumbers = PhoneNumbers.newBuilder().
                        setLand(phoneNumbersDict.getString("land")).
                        setMobile(phoneNumbersDict.getString("mobile")).
                        setSatellite(phoneNumbersDict.getString("satellite")).build();

                LocalContact localContact = LocalContact.newBuilder().setUserName(userName)
                        .setEmailAddresses(emailAddresses)
                        .setPhoneNumbers(phoneNumbers).build();
                input.addLocalContacts(localContact);

            }
        }



        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.accept(input.build(), new StreamObserver<AgentGuardBoolResponse>() {
            @Override
            public void onNext(AgentGuardBoolResponse value) {
                callback.invoke(null, new AgentGuardBoolResponseConverter().toResponse(value));
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
    public void remove(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::remove", sessionId);
        ContactsServiceGrpc.ContactsServiceStub stub = ContactsServiceGrpc.newStub(mChannel);

        ContactsInput.Builder input = ContactsInput.newBuilder();
        if (params.hasKey("userIds") && params.getArray("userIds") != null) {
            ReadableArray userIds = params.getArray("userIds");
            for(int i = 0; i < userIds.size(); ++i) {
                input.addUserIds(userIds.getString(i));
            }
        }

        if (params.hasKey("localContacts")) {

            ReadableArray localContacts = params.getArray("localContacts");
            for (int i = 0; i < localContacts.size(); ++i) {

                ReadableMap lContactDict = localContacts.getMap(i);
                String userName = lContactDict.getString("userName");
                String userId = lContactDict.getString("userId");
                ReadableMap emailAddressesDict = lContactDict.getMap("emailAddresses");
                ReadableMap phoneNumbersDict = lContactDict.getMap("phoneNumbers");

                EmailAddresses emailAddresses = EmailAddresses.newBuilder().
                        setHome(emailAddressesDict.getString("home")).
                        setWork(emailAddressesDict.getString("work")).build();

                PhoneNumbers phoneNumbers = PhoneNumbers.newBuilder().
                        setLand(phoneNumbersDict.getString("land")).
                        setMobile(phoneNumbersDict.getString("mobile")).
                        setSatellite(phoneNumbersDict.getString("satellite")).build();

                LocalContact localContact = LocalContact.newBuilder().setUserName(userName)
                        .setUserId(userId)
                        .setEmailAddresses(emailAddresses)
                        .setPhoneNumbers(phoneNumbers).build();
                input.addLocalContacts(localContact);

            }
        }



        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.remove(input.build(), new StreamObserver<AgentGuardBoolResponse>() {
            @Override
            public void onNext(AgentGuardBoolResponse value) {
                callback.invoke(null, new AgentGuardBoolResponseConverter().toResponse(value));
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
    public void invite(String sessionId, ReadableMap params, final Callback callback)
    {
        Log.d("GRPC:::invit", sessionId);
        ContactsServiceGrpc.ContactsServiceStub stub = ContactsServiceGrpc.newStub(mChannel);

        EmailIdList.Builder input = EmailIdList.newBuilder();
        if (params.getArray("emailIds") != null) {
            ReadableArray emailIds = params.getArray("emailIds");
            for(int i = 0; i < emailIds.size(); ++i) {
                input.addEmailIds(emailIds.getString(i));
            }
        }

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("sessionId", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key, sessionId);

        stub = MetadataUtils.attachHeaders(stub, header);

        stub.invite(input.build(), new StreamObserver<AgentGuardBoolResponse>() {
            @Override
            public void onNext(AgentGuardBoolResponse value) {
                callback.invoke(null, new AgentGuardBoolResponseConverter().toResponse(value));
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
