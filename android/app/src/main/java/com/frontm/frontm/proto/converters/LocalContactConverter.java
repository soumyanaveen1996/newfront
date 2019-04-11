package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.commonmessages.proto.LocalContact;

public class LocalContactConverter {

    public WritableMap toJson(LocalContact contact) {
        WritableMap map = Arguments.createMap();
        map.putString("userName", contact.getUserName());
        if (contact.hasPhoneNumbers()) {
            map.putMap("phoneNumbers", new PhoneNumbersConverter().toJson(contact.getPhoneNumbers()));
        }

         if (contact.hasEmailAddresses()) {
            map.putMap("emailAddresses", new EmailAddressesConverter().toJson(contact.getEmailAddresses()));
        }

        return map;
    }
}