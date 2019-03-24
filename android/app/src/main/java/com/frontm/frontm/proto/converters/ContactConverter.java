package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignInUser;
import com.frontm.auth.proto.SigninResponse;
import com.frontm.user.proto.Contact;

public class ContactConverter {

    public WritableMap toJson(Contact contact) {
        WritableMap map = Arguments.createMap();
        map.putString("userName", contact.getUserName());
        map.putString("userId", contact.getUserId());
        map.putString("emailAddress", contact.getEmailAddress());
        map.putBoolean("waitingForConfirmation", contact.getWaitingForConfirmation());
        if (contact.hasPhoneNumbers()) {
            map.putMap("phoneNumbers", new PhoneNumbersConverter().toJson(contact.getPhoneNumbers()));
        }

        return map;
    }
}
