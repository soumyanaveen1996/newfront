package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignInUser;
import com.frontm.auth.proto.SignupResponse;
import com.frontm.user.proto.Contact;
import com.frontm.user.proto.ContactsResponse;

public class ContactsResponseConverter {

    public WritableMap toJson(ContactsResponse response) {
        WritableMap map = Arguments.createMap();

        if (response.getContactsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContactsCount(); ++i) {
                array.pushMap(new ContactConverter().toJson(response.getContacts(i)));
            }
            map.putArray("contacts", array);
        } else {
            map.putArray("contacts", Arguments.createArray());
        }

        if (response.getIgnoredCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getIgnoredCount(); ++i) {
                array.pushMap(new ContactConverter().toJson(response.getIgnored(i)));
            }
            map.putArray("ignored", array);
        } else {
            map.putArray("ignored", Arguments.createArray());
        }

        return map;
    }


    public WritableMap toResponse(ContactsResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
